import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

/**
 * Cloudinary Configuration
 * Used for uploading issue images and resolution proofs
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for issue images
const issueStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nagarsathi/issues',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    },
});

// Storage configuration for resolution proof images
const resolutionStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nagarsathi/resolutions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    },
});

// Base multer upload for issues (max 5 images)
const issueUpload = multer({
    storage: issueStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
}).array('images', 5);

// Base multer upload for resolution proof (max 3 images)
const resolutionUpload = multer({
    storage: resolutionStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 3);

/**
 * Wrapper middleware for issue image uploads
 * Provides detailed error handling and logging
 */
export const uploadIssueImages = (req, res, next) => {
    console.log('[Image Upload] Starting issue image upload...');

    issueUpload(req, res, (err) => {
        if (err) {
            console.error('[Image Upload Error] Issue upload failed:', {
                errorName: err.name,
                errorMessage: err.message,
                errorCode: err.code,
                httpCode: err.http_code,
                storageErrors: err.storageErrors,
                field: err.field,
                timestamp: new Date().toISOString()
            });

            // Pass error to the global error handler
            return next(err);
        }

        // Log successful upload
        if (req.files && req.files.length > 0) {
            console.log('[Image Upload] Success:', {
                filesCount: req.files.length,
                files: req.files.map(f => ({
                    originalname: f.originalname,
                    size: f.size,
                    path: f.path
                }))
            });
        }

        next();
    });
};

/**
 * Wrapper middleware for resolution proof image uploads
 * Provides detailed error handling and logging
 */
export const uploadResolutionImages = (req, res, next) => {
    console.log('[Image Upload] Starting resolution proof upload...');

    resolutionUpload(req, res, (err) => {
        if (err) {
            console.error('[Image Upload Error] Resolution upload failed:', {
                errorName: err.name,
                errorMessage: err.message,
                errorCode: err.code,
                httpCode: err.http_code,
                storageErrors: err.storageErrors,
                field: err.field,
                timestamp: new Date().toISOString()
            });

            // Pass error to the global error handler
            return next(err);
        }

        // Log successful upload
        if (req.files && req.files.length > 0) {
            console.log('[Image Upload] Success:', {
                filesCount: req.files.length,
                files: req.files.map(f => ({
                    originalname: f.originalname,
                    size: f.size,
                    path: f.path
                }))
            });
        }

        next();
    });
};

// Helper function to delete images from Cloudinary
export const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log('[Cloudinary] Image deleted:', publicId);
    } catch (error) {
        console.error('[Cloudinary Error] Failed to delete image:', {
            publicId,
            error: error.message
        });
    }
};

export default cloudinary;

