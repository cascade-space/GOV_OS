const express = require('express');
const router = express.Router();
const mlaController = require('../controllers/mla.controller');
const { adminOrMLA } = require('../middleware/adminAuth.middleware');

// MLA routes allow both 'admin' and 'mla' roles
router.get('/issues', adminOrMLA, mlaController.getConstituencyIssues);
router.get('/stats', adminOrMLA, mlaController.getMLAStats);
router.get('/department-performance', adminOrMLA, mlaController.getDepartmentPerformance);
router.get('/complaint-locations', adminOrMLA, mlaController.getComplaintLocations);
router.post('/directives', adminOrMLA, mlaController.issueDirective);
router.get('/directives', adminOrMLA, mlaController.getDirectives);

module.exports = router;
