const { pool } = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOfficerWelcomeEmail, resendOfficerCredentials } = require('../utils/email');

// Generate a random password
function generatePassword(length = 10) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * POST /api/v1/officers/create
 * MLA creates a new officer
 */
exports.createOfficer = async (req, res) => {
    try {
        const { name, email, department, password: providedPassword } = req.body;
        const mlaUser = req.mlaUser;

        // Validate required fields
        if (!name || !email || !department) {
            return res.status(400).json({ success: false, error: 'Name, email, and department are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Check if email already exists in officers table
        const existing = await pool.query('SELECT id FROM officers WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'An officer with this email already exists' });
        }

        // Use provided password or auto-generate
        const plainPassword = providedPassword || generatePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // Insert officer
        const result = await pool.query(
            `INSERT INTO officers (name, email, password_hash, department, role, mla_id, constituency_id, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'officer', $5, $6, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, name, email, department, role, status, created_at`,
            [name.trim(), email.toLowerCase().trim(), passwordHash, department.trim(), mlaUser.id || null, mlaUser.constituency_id || null]
        );

        const officer = result.rows[0];

        logger.info(`Officer created: ${email} by MLA ${mlaUser.email}`);

        // Send welcome email with credentials (non-blocking)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const loginUrl = `${frontendUrl}/officer/login`;
        const emailResult = await sendOfficerWelcomeEmail({
            officerName: name.trim(),
            officerEmail: email.toLowerCase().trim(),
            password: plainPassword,
            department: department.trim(),
            loginUrl
        });

        res.status(201).json({
            success: true,
            message: 'Officer created successfully',
            data: {
                officer,
                emailSent: emailResult.success,
                emailPreview: emailResult.previewUrl || null,
                // Only return generated password if it was auto-generated
                ...(providedPassword ? {} : { generatedPassword: plainPassword })
            }
        });
    } catch (error) {
        logger.error('Create officer error:', error);
        res.status(500).json({ success: false, error: 'Failed to create officer' });
    }
};

/**
 * POST /api/v1/officers/login
 * Officer login with JWT
 */
exports.loginOfficer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Find officer
        const result = await pool.query(
            'SELECT id, name, email, password_hash, department, role, status FROM officers WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const officer = result.rows[0];

        if (officer.status !== 'active') {
            return res.status(401).json({ success: false, error: 'Account is inactive. Contact your MLA.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, officer.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Update last login
        await pool.query('UPDATE officers SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [officer.id]);

        // Generate JWT
        const token = jwt.sign(
            { id: officer.id, email: officer.email, role: 'officer' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        logger.info(`Officer login: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                officer: {
                    id: officer.id,
                    name: officer.name,
                    email: officer.email,
                    department: officer.department,
                    role: officer.role
                }
            }
        });
    } catch (error) {
        logger.error('Officer login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
};

/**
 * GET /api/v1/officers
 * Get all officers (MLA only - sees their own officers)
 */
exports.getAllOfficers = async (req, res) => {
    try {
        const mlaUser = req.mlaUser;

        // Admin sees all, MLA sees only their officers
        let query, params;
        if (mlaUser.role === 'admin') {
            query = `SELECT id, name, email, department, role, status, created_at, last_login FROM officers ORDER BY created_at DESC`;
            params = [];
        } else {
            query = `SELECT id, name, email, department, role, status, created_at, last_login FROM officers WHERE mla_id = $1 ORDER BY created_at DESC`;
            params = [mlaUser.id];
        }

        const result = await pool.query(query, params);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Get officers error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch officers' });
    }
};

/**
 * GET /api/v1/officers/dashboard
 * Officer dashboard data (officer JWT required)
 */
exports.getOfficerDashboard = async (req, res) => {
    try {
        const officer = req.officer;

        // Get assigned complaints/tasks
        const tasksResult = await pool.query(
            `SELECT id, title, description, category, priority, status, citizen_name, location_address, created_at, updated_at
             FROM complaints
             WHERE assigned_officer_id = $1
             ORDER BY 
               CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
               created_at DESC
             LIMIT 20`,
            [officer.id]
        );

        // Get stats
        const statsResult = await pool.query(
            `SELECT
               COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
               COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
               COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
               COUNT(*) as total
             FROM complaints WHERE assigned_officer_id = $1`,
            [officer.id]
        );

        res.json({
            success: true,
            data: {
                officer: {
                    id: officer.id,
                    name: officer.name,
                    email: officer.email,
                    department: officer.department
                },
                tasks: tasksResult.rows,
                stats: statsResult.rows[0]
            }
        });
    } catch (error) {
        logger.error('Officer dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to load dashboard' });
    }
};

/**
 * PATCH /api/v1/officers/:id/status
 * Deactivate/activate officer (MLA only)
 */
exports.updateOfficerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status must be active or inactive' });
        }

        const result = await pool.query(
            'UPDATE officers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, status',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Officer not found' });
        }

        res.json({ success: true, message: `Officer ${status}`, data: result.rows[0] });
    } catch (error) {
        logger.error('Update officer status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update officer status' });
    }
};

/**
 * DELETE /api/v1/officers/:id
 * Delete officer permanently (MLA only)
 */
exports.deleteOfficer = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM officers WHERE id = $1 RETURNING id, name, email',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Officer not found' });
        }

        logger.info(`Officer deleted: ${result.rows[0].email}`);
        res.json({ success: true, message: 'Officer deleted', data: result.rows[0] });
    } catch (error) {
        logger.error('Delete officer error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete officer' });
    }
};

/**
 * POST /api/v1/officers/:id/regenerate-password
 * Generate new password, update DB, email officer (MLA only)
 */
exports.regeneratePassword = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT id, name, email, department, status FROM officers WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Officer not found' });
        }

        const officer = result.rows[0];
        const newPassword = generatePassword();
        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE officers SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordHash, id]
        );

        // Email the new credentials
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const emailResult = await sendOfficerWelcomeEmail({
            officerName: officer.name,
            officerEmail: officer.email,
            password: newPassword,
            department: officer.department,
            loginUrl: `${frontendUrl}/officer/login`
        });

        logger.info(`Password regenerated for officer: ${officer.email}`);

        res.json({
            success: true,
            message: 'Password regenerated successfully',
            data: {
                newPassword,
                emailSent: emailResult.success,
                emailPreview: emailResult.previewUrl || null
            }
        });
    } catch (error) {
        logger.error('Regenerate password error:', error);
        res.status(500).json({ success: false, error: 'Failed to regenerate password' });
    }
};

/**
 * POST /api/v1/officers/:id/resend-credentials
 * Resend login reminder email (MLA only)
 */
exports.resendCredentials = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT id, name, email, department, status FROM officers WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Officer not found' });
        }

        const officer = result.rows[0];
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const emailResult = await resendOfficerCredentials({
            officerName: officer.name,
            officerEmail: officer.email,
            department: officer.department,
            loginUrl: `${frontendUrl}/officer/login`
        });

        res.json({
            success: true,
            message: emailResult.success ? 'Reminder email sent' : 'Email delivery failed — check server logs',
            emailSent: emailResult.success
        });
    } catch (error) {
        logger.error('Resend credentials error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend credentials' });
    }
};
