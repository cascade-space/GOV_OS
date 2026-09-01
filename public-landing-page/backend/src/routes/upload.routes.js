const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');

router.post('/', upload.array('files', 5), uploadController.uploadFiles);

module.exports = router;
