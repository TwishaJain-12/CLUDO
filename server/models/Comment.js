import mongoose from 'mongoose';

/**
 * Comment Model
 * Stores comments on issues
 */
const commentSchema = new mongoose.Schema(
    {
        issue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Issue',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for fetching comments by issue
commentSchema.index({ issue: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
