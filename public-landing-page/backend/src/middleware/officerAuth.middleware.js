const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Verify JWT token for officer authentication
 */
const verifyOfficerToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({ success: false, error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify officer still exists and is active
        const result = await pool.query(
            'SELECT id, name, email, department, role, status FROM officers WHERE id = $1 AND status = $2',
            [decoded.id, 'active']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Officer not found or inactive' });
        }

        req.officer = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' });
        }
        logger.error('Officer auth error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
};

/**
 * Verify MLA role via x-user-email header (uses existing RBAC system)
 */
const verifyMLA = async (req, res, next) => {
    try {
        const userEmail = req.headers['x-user-email'];

        if (!userEmail) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const result = await pool.query(
            "SELECT id, email, role, full_name, status, constituency_id FROM users WHERE email = $1 AND role IN ('admin', 'mla') AND status = 'active'",
            [userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'MLA or Admin access required' });
        }

        req.mlaUser = result.rows[0];
        next();
    } catch (error) {
        logger.error('MLA verification error:', error);
        res.status(500).json({ success: false, error: 'Authorization failed' });
    }
};

module.exports = { verifyOfficerToken, verifyMLA };
