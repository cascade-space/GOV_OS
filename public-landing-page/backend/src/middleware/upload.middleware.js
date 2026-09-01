const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./error.middleware');
const { cloudinaryStorage } = require('../config/cloudinary');

// Determine which storage to use
const useCloudinary = process.env.USE_CLOUDINARY === 'true';

// Local storage configuration
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!useCloudinary && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(`File type ${file.mimetype} not allowed`, 400), false);
    }
};

// Configure multer with appropriate storage
const upload = multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
    },
    fileFilter: fileFilter
});

module.exports = upload;
