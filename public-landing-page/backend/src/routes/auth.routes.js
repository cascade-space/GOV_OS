const express = require('express');
const router = express.Router();
const { getUserRole, login } = require('../middleware/adminAuth.middleware');
const { requestPublicOtp, verifyOtp } = require('../controllers/auth.controller');

/**
 * Auth routes for RBAC system
 * These endpoints help frontend determine user roles and permissions
 */

// Login endpoint
router.post('/login', login);

// Check user's admin role for frontend RBAC
router.get('/check-role', getUserRole);

// Citizen OTP login endpoints
router.post('/public/otp/request', requestPublicOtp);
router.post('/otp/verify', verifyOtp);

// Test endpoint to verify RBAC is working
router.get('/test-admin', require('../middleware/adminAuth.middleware').adminOnly, (req, res) => {
    res.json({
        success: true,
        message: 'Admin access granted',
        userRole: req.userRole,
        isAdmin: req.isAdmin
    });
});

router.get('/test-mla', require('../middleware/adminAuth.middleware').adminOrMLA, (req, res) => {
    res.json({
        success: true,
        message: 'MLA access granted',
        userRole: req.userRole,
        isAdmin: req.isAdmin,
        isMLA: req.isMLA
    });
});

module.exports = router;