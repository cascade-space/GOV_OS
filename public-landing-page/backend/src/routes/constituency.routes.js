const express = require('express');
const router = express.Router();
const constituencyController = require('../controllers/constituency.controller');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Simple superadmin auth middleware
const verifySuperAdmin = async (req, res, next) => {
    try {
        const userEmail = req.headers['x-user-email'];
        if (!userEmail) return res.status(401).json({ success: false, error: 'Authentication required' });
        const result = await pool.query(
            "SELECT id, email, role FROM users WHERE email = $1 AND status = 'active'",
            [userEmail]
        );
        if (result.rows.length === 0) return res.status(403).json({ success: false, error: 'Access denied' });
        req.superUser = result.rows[0];
        next();
    } catch (error) {
        logger.error('Auth error:', error);
        res.status(500).json({ success: false, error: 'Authorization failed' });
    }
};

// Public routes (citizen form uses these)
router.get('/', constituencyController.getAll);
router.get('/all-wards', constituencyController.getAllWards);
router.get('/:id/wards', constituencyController.getWards);
router.get('/:id/stats', constituencyController.getStats);

// Protected routes (superadmin only)
router.post('/', verifySuperAdmin, constituencyController.create);
router.post('/:id/wards', verifySuperAdmin, constituencyController.addWard);
router.delete('/:id/wards/:wardId', verifySuperAdmin, constituencyController.removeWard);
router.patch('/:id/assign-mla', verifySuperAdmin, constituencyController.assignMLA);

module.exports = router;
