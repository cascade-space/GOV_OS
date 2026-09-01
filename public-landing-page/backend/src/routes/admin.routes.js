const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminOnly } = require('../middleware/adminAuth.middleware');

// All admin routes require 'admin' role only
router.get('/stats', adminOnly, adminController.getDashboardStats);
router.get('/analytics', adminOnly, adminController.getAnalytics);
router.get('/officers', adminOnly, adminController.getAllOfficers);
router.post('/officers', adminOnly, adminController.createOfficer);
router.get('/notifications', adminOnly, adminController.getNotificationCounts);

module.exports = router;