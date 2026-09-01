const logger = require('../utils/logger');

exports.uploadFiles = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`
        }));

        logger.info(`${files.length} files uploaded successfully`);

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: files
        });
    } catch (error) {
        logger.error('Error uploading files:', error);
        next(error);
    }
};
