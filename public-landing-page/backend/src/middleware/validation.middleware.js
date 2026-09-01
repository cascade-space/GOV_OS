const { body, validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

// Validation middleware wrapper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        throw new AppError(errorMessages, 400);
    }
    next();
};

// Middleware to parse location JSON from FormData
const parseLocationFromFormData = (req, res, next) => {
    if (req.body.location && typeof req.body.location === 'string') {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch (error) {
            throw new AppError('Invalid location data format', 400);
        }
    }
    next();
};

// Complaint validation rules
exports.validateComplaint = [
    parseLocationFromFormData, // Parse location JSON before validation
    body('title')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Title must be between 10 and 500 characters'),
    body('description')
        .trim()
        .isLength({ min: 20 })
        .withMessage('Description must be at least 20 characters'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('subCategory')
        .trim()
        .notEmpty()
        .withMessage('Sub-category is required'),
    body('priority')
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority level'),
    body('citizenName')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Citizen name is required'),
    body('citizenMobile')
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Invalid mobile number (must be 10 digits)'),
    body('citizenEmail')
        .optional()
        .isEmail()
        .withMessage('Invalid email address'),
    body('location.address')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Location address is required'),
    body('location.latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    body('location.longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    body('location.ward')
        .trim()
        .notEmpty()
        .withMessage('Ward is required'),
    validate
];

// Status update validation
exports.validateStatusUpdate = [
    body('status')
        .isIn(['submitted', 'validated', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'])
        .withMessage('Invalid status'),
    body('note')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Note must not exceed 500 characters'),
    validate
];

// Assignment validation
exports.validateAssignment = [
    body('assignedDept')
        .isUUID()
        .withMessage('Invalid department ID'),
    body('assignedOfficer')
        .optional()
        .isUUID()
        .withMessage('Invalid officer ID'),
    validate
];

// Comment validation
exports.validateComment = [
    body('comment_text')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    body('visibility')
        .optional()
        .isIn(['public', 'internal', 'private'])
        .withMessage('Invalid visibility'),
    validate
];
