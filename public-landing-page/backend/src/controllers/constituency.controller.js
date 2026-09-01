const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/v1/constituencies
 * List all active constituencies (public — used by citizen form)
 */
exports.getAll = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.name, c.description,
                    COUNT(w.id) as ward_count,
                    u.full_name as mla_name, u.email as mla_email
             FROM constituencies c
             LEFT JOIN wards w ON w.constituency_id = c.id AND w.is_active = true
             LEFT JOIN users u ON u.constituency_id = c.id AND u.role = 'mla' AND u.status = 'active'
             WHERE c.is_active = true
             GROUP BY c.id, c.name, c.description, u.full_name, u.email
             ORDER BY c.name ASC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Get constituencies error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch constituencies' });
    }
};

/**
 * GET /api/v1/constituencies/:id/wards
 * Get wards for a specific constituency (public — used by citizen form dropdown)
 */
exports.getWards = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, name FROM wards WHERE constituency_id = $1 AND is_active = true ORDER BY name ASC',
            [id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Get wards error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wards' });
    }
};

/**
 * GET /api/v1/constituencies/all-wards
 * Get all wards with their constituency (for citizen form — flat list)
 */
exports.getAllWards = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT w.id, w.name, w.constituency_id, c.name as constituency_name
             FROM wards w
             JOIN constituencies c ON c.id = w.constituency_id
             WHERE w.is_active = true AND c.is_active = true
             ORDER BY c.name, w.name ASC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Get all wards error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wards' });
    }
};

/**
 * POST /api/v1/constituencies
 * Create constituency (superadmin only)
 */
exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

        const result = await pool.query(
            'INSERT INTO constituencies (name, description) VALUES ($1, $2) RETURNING *',
            [name.trim(), description?.trim() || null]
        );
        logger.info(`Constituency created: ${name}`);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, error: 'Constituency name already exists' });
        }
        logger.error('Create constituency error:', error);
        res.status(500).json({ success: false, error: 'Failed to create constituency' });
    }
};

/**
 * POST /api/v1/constituencies/:id/wards
 * Add ward to constituency (superadmin only)
 */
exports.addWard = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Ward name is required' });

        const result = await pool.query(
            'INSERT INTO wards (name, constituency_id) VALUES ($1, $2) RETURNING *',
            [name.trim(), id]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, error: 'Ward already exists in this constituency' });
        }
        logger.error('Add ward error:', error);
        res.status(500).json({ success: false, error: 'Failed to add ward' });
    }
};

/**
 * DELETE /api/v1/constituencies/:id/wards/:wardId
 * Soft-delete a ward (superadmin only)
 */
exports.removeWard = async (req, res) => {
    try {
        const { wardId } = req.params;
        await pool.query('UPDATE wards SET is_active = false WHERE id = $1', [wardId]);
        res.json({ success: true, message: 'Ward removed' });
    } catch (error) {
        logger.error('Remove ward error:', error);
        res.status(500).json({ success: false, error: 'Failed to remove ward' });
    }
};

/**
 * PATCH /api/v1/constituencies/:id/assign-mla
 * Assign an MLA user to a constituency (superadmin only)
 */
exports.assignMLA = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ success: false, error: 'user_id is required' });

        // Unassign any existing MLA from this constituency first
        await pool.query(
            "UPDATE users SET constituency_id = NULL WHERE constituency_id = $1 AND role = 'mla'",
            [id]
        );

        // Assign new MLA
        const result = await pool.query(
            "UPDATE users SET constituency_id = $1 WHERE id = $2 AND role = 'mla' RETURNING id, email, full_name, constituency_id",
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'MLA user not found' });
        }

        // Also update all officers under this MLA
        await pool.query(
            "UPDATE officers SET constituency_id = $1 WHERE mla_id = $2",
            [id, user_id]
        );

        logger.info(`MLA ${user_id} assigned to constituency ${id}`);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Assign MLA error:', error);
        res.status(500).json({ success: false, error: 'Failed to assign MLA' });
    }
};

/**
 * GET /api/v1/constituencies/:id/stats
 * Stats for a specific constituency (superadmin)
 */
exports.getStats = async (req, res) => {
    try {
        const { id } = req.params;
        const [complaintStats, officerCount] = await Promise.all([
            pool.query(
                `SELECT COUNT(*) as total,
                        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                        COUNT(CASE WHEN status IN ('submitted','validated','assigned','in_progress') THEN 1 END) as pending
                 FROM complaints WHERE constituency_id = $1`,
                [id]
            ),
            pool.query('SELECT COUNT(*) as count FROM officers WHERE constituency_id = $1 AND status = $2', [id, 'active'])
        ]);
        res.json({
            success: true,
            data: {
                ...complaintStats.rows[0],
                active_officers: officerCount.rows[0].count
            }
        });
    } catch (error) {
        logger.error('Constituency stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};
