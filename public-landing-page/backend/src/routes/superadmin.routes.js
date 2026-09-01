const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin.controller');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Simple superadmin auth middleware — checks x-user-email has role 'superadmin'
const verifySuperAdmin = async (req, res, next) => {
    try {
        const userEmail = req.headers['x-user-email'];
        if (!userEmail) return res.status(401).json({ success: false, error: 'Authentication required' });

        const result = await pool.query(
            "SELECT id, email, role, full_name, status FROM users WHERE email = $1 AND status = 'active'",
            [userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        req.superUser = result.rows[0];
        next();
    } catch (error) {
        logger.error('SuperAdmin auth error:', error);
        res.status(500).json({ success: false, error: 'Authorization failed' });
    }
};

router.get('/overview', verifySuperAdmin, superadminController.getOverview);
router.get('/users', verifySuperAdmin, superadminController.getAllUsers);
router.get('/officers', verifySuperAdmin, superadminController.getAllOfficers);
router.get('/complaints', verifySuperAdmin, superadminController.getAllComplaints);
router.get('/trend', verifySuperAdmin, superadminController.getTrend);

module.exports = router;
