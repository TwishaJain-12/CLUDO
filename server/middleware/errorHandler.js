/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses across the API
 */

// Custom API Error class
export class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// 404 Not Found handler
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
    next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Log error details (always log for debugging)
    console.error('[API Error]', {
        message: err.message,
        statusCode: err.statusCode,
        name: err.name,
        httpCode: err.http_code,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field: ${field}`;
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        statusCode = 400;
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large. Maximum size is 5MB.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field.';
                break;
            default:
                message = 'File upload error.';
        }
    }

    // Cloudinary errors
    if (err.http_code || err.message?.includes('format') || err.message?.includes('Cloudinary')) {
        statusCode = err.http_code || 400;

        // Handle specific Cloudinary error messages
        if (err.message?.toLowerCase().includes('format') && err.message?.toLowerCase().includes('not allowed')) {
            const formatMatch = err.message.match(/format\s+(\w+)/i);
            const format = formatMatch ? formatMatch[1].toUpperCase() : 'this';
            message = `Image format ${format} is not supported. Please use JPG, JPEG, PNG, or WebP.`;
        } else if (err.message?.includes('File size too large')) {
            message = 'Image file is too large. Maximum size is 5MB.';
        } else if (err.message?.includes('Invalid image file')) {
            message = 'The file appears to be corrupted or is not a valid image.';
        } else {
            message = 'Image upload failed. Please try again with a different image.';
        }

        // Log the full error for debugging
        console.error('[Cloudinary Error]', {
            originalMessage: err.message,
            httpCode: err.http_code,
            storageErrors: err.storageErrors,
            stack: err.stack
        });
    }

    // JWT/Auth errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid or expired authentication token.';
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
