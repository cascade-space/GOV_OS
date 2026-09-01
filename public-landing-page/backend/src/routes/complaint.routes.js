const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { validateComplaint } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.post('/', upload.array('attachments', 5), validateComplaint, complaintController.createComplaint);
router.get('/public/my', complaintController.getMyComplaints);
router.get('/track/:complaintNumber', complaintController.trackComplaint);

// Protected routes (add auth middleware later)
router.get('/', complaintController.getAllComplaints);
router.get('/:id', complaintController.getComplaintById);
router.patch('/:id/status', complaintController.updateStatus);
router.patch('/:id/assign', complaintController.assignComplaint);
router.post('/:id/escalate', complaintController.escalateComplaint);
router.post('/:id/comments', complaintController.addComment);
router.get('/stats/dashboard', complaintController.getStats);

module.exports = router;
