import mongoose from 'mongoose';

/**
 * Issue Model
 * Core model for civic issues reported by citizens
 * Includes geospatial indexing for map-based queries
 */
const statusTimelineSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['reported', 'in_progress', 'resolved'],
            required: true,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        note: {
            type: String,
            maxlength: 500,
        },
    },
    { _id: false }
);

const resolutionProofSchema = new mongoose.Schema(
    {
        images: [String],
        note: {
            type: String,
            maxlength: 1000,
        },
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { _id: false }
);

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Issue title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Issue description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            required: true,
            enum: {
                values: ['pothole', 'garbage', 'water_leak', 'streetlight', 'drainage', 'road_damage', 'other'],
                message: 'Invalid category',
            },
        },
        images: {
            type: [String], // Cloudinary URLs
            validate: {
                validator: function (v) {
                    return v.length <= 5;
                },
                message: 'Maximum 5 images allowed',
            },
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude] - optional now
                default: [0, 0],
                validate: {
                    validator: function (v) {
                        if (!v || v.length === 0) return true; // Allow empty
                        return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
                    },
                    message: 'Invalid coordinates',
                },
            },
            address: {
                type: String,
                trim: true,
                maxlength: 500,
                required: [true, 'Location address is required'],
            },
        },
        state: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        district: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        status: {
            type: String,
            enum: ['reported', 'in_progress', 'resolved'],
            default: 'reported',
        },
        statusTimeline: {
            type: [statusTimelineSchema],
            default: function () {
                return [{ status: 'reported', updatedAt: new Date() }];
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        upvotesCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        resolutionProof: resolutionProofSchema,
    },
    {
        timestamps: true,
    }
);

// Geospatial index for location-based queries
issueSchema.index({ location: '2dsphere' });

// Indexes for common queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, createdAt: -1 });
issueSchema.index({ createdBy: 1, createdAt: -1 });
issueSchema.index({ upvotesCount: -1 });

// Virtual for formatted creation date
issueSchema.virtual('createdAtFormatted').get(function () {
    if (!this.createdAt) return '';
    return this.createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
});

// Ensure virtuals are included in JSON output
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
