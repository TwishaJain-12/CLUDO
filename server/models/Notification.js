import mongoose from 'mongoose';

/**
 * Notification Schema
 * Stores in-app notifications for users
 */
const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'report_reviewed',      // Reporter's report was reviewed
                'report_dismissed',     // Reporter's report was dismissed
                'issue_warning',        // Issue owner's issue received reports
                'issue_deleted',        // Issue owner's issue was deleted due to reports
                'issue_resolved',       // Issue owner's issue was resolved
                'issue_status_update',  // Issue status changed
            ],
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        // Related data for navigation
        data: {
            issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
            reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'IssueReport' },
            action: String, // 'reviewed', 'dismissed', 'action_taken'
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function ({
    userId,
    type,
    title,
    message,
    data = {}
}) {
    try {
        const notification = await this.create({
            user: userId,
            type,
            title,
            message,
            data,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ user: userId, read: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
