const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officer.controller');
const { verifyOfficerToken, verifyMLA } = require('../middleware/officerAuth.middleware');

// Officer auth routes (public)
router.post('/login', officerController.loginOfficer);

// MLA-protected routes (require MLA/admin role)
router.post('/create', verifyMLA, officerController.createOfficer);
router.get('/', verifyMLA, officerController.getAllOfficers);
router.patch('/:id/status', verifyMLA, officerController.updateOfficerStatus);
router.delete('/:id', verifyMLA, officerController.deleteOfficer);
router.post('/:id/resend-credentials', verifyMLA, officerController.resendCredentials);
router.post('/:id/regenerate-password', verifyMLA, officerController.regeneratePassword);

// Officer-protected routes (require officer JWT)
router.get('/dashboard', verifyOfficerToken, officerController.getOfficerDashboard);

module.exports = router;
