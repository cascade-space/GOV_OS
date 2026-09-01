const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary
if (process.env.USE_CLOUDINARY === 'true') {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    logger.info('☁️  Cloudinary configured successfully');
}

// Create Cloudinary storage for multer with dynamic params
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Generate UUID for unique identification
        const uuid = uuidv4();
        const category = req.body.category || 'general';
        
        // Create a temporary filename with UUID that will be updated after complaint creation
        const publicId = `temp_${uuid}`;
        
        return {
            folder: 'civicpath-complaints',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            public_id: publicId,
            transformation: [
                { width: 1920, height: 1920, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            // Add searchable tags (will be updated after complaint creation)
            tags: [
                `category:${category}`,
                'civicpath',
                'complaint-image',
                'temp-upload'
            ],
            // Add structured metadata (will be updated after complaint creation)
            context: {
                category: category,
                upload_date: new Date().toISOString(),
                uploaded_by: 'citizen',
                status: 'pending',
                uuid: uuid
            }
        };
    }
});

// Function to rename uploaded file with complaint details
const renameCloudinaryFile = async (oldPublicId, complaintNumber, complaintId, category) => {
    try {
        // Extract UUID from temp filename (format: temp_uuid)
        const uuid = oldPublicId.replace('temp_', '');
        
        // New format: UUID_COMPLAINT-NUMBER
        const newPublicId = `${uuid}_${complaintNumber}`;
        
        // Rename the file in Cloudinary
        const result = await cloudinary.uploader.rename(
            `civicpath-complaints/${oldPublicId}`,
            `civicpath-complaints/${newPublicId}`,
            {
                overwrite: false,
                invalidate: true
            }
        );
        
        // Update metadata
        await cloudinary.uploader.explicit(
            result.public_id,
            {
                type: 'upload',
                context: {
                    complaint_number: complaintNumber,
                    complaint_id: complaintId.toString(),
                    category: category,
                    status: 'active',
                    uuid: uuid
                }
            }
        );
        
        // Update tags
        await cloudinary.uploader.add_tag(
            [`complaint:${complaintNumber}`, `id:${complaintId}`],
            [result.public_id]
        );
        
        // Remove temp tag
        await cloudinary.uploader.remove_tag('temp-upload', [result.public_id]);
        
        logger.info(`Renamed Cloudinary file: ${oldPublicId} -> ${newPublicId}`);
        
        return result.secure_url;
    } catch (error) {
        logger.error('Error renaming Cloudinary file:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    cloudinaryStorage,
    renameCloudinaryFile
};
