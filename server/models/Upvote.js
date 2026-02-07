import mongoose from 'mongoose';

/**
 * Upvote Model
 * Tracks which users have upvoted which issues
 * Uses compound unique index to prevent duplicate upvotes
 */
const upvoteSchema = new mongoose.Schema(
    {
        issue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Issue',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: one upvote per user per issue
upvoteSchema.index({ issue: 1, user: 1 }, { unique: true });

// Index for counting upvotes per issue
upvoteSchema.index({ issue: 1 });

const Upvote = mongoose.model('Upvote', upvoteSchema);

export default Upvote;
