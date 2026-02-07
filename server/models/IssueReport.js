import mongoose from 'mongoose';

/**
 * IssueReport Model
 * Stores user reports/flags for issues (spam, inaccurate, etc.)
 * Used for community moderation
 */
const issueReportSchema = new mongoose.Schema(
    {
        issue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Issue',
            required: [true, 'Issue reference is required'],
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reporter reference is required'],
        },
        reason: {
            type: String,
            enum: {
                values: ['spam', 'inaccurate', 'already_resolved', 'duplicate', 'inappropriate', 'other'],
                message: 'Invalid report reason',
            },
            required: [true, 'Report reason is required'],
        },
        details: {
            type: String,
            maxlength: [500, 'Details cannot exceed 500 characters'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewNote: {
            type: String,
            maxlength: 500,
            trim: true,
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reports from same user for same issue
issueReportSchema.index({ issue: 1, reporter: 1 }, { unique: true });

// Index for efficient admin queries
issueReportSchema.index({ status: 1, createdAt: -1 });
issueReportSchema.index({ issue: 1, status: 1 });

// Virtual for formatted creation date
issueReportSchema.virtual('createdAtFormatted').get(function () {
    return this.createdAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
});

// Ensure virtuals are included in JSON output
issueReportSchema.set('toJSON', { virtuals: true });
issueReportSchema.set('toObject', { virtuals: true });

const IssueReport = mongoose.model('IssueReport', issueReportSchema);

export default IssueReport;
