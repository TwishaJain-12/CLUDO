import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * Comment Controller
 * Handles comment operations on issues
 */

// @desc    Add comment to issue
// @route   POST /api/issues/:issueId/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { content } = req.body;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    // Create comment
    const comment = await Comment.create({
        issue: issueId,
        user: req.user._id,
        content,
    });

    // Increment comments count on issue
    await Issue.findByIdAndUpdate(issueId, { $inc: { commentsCount: 1 } });

    // Populate user info
    await comment.populate('user', 'name avatar');

    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
    });
});

// @desc    Get comments for an issue
// @route   GET /api/issues/:issueId/comments
// @access  Public
export const getComments = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    const total = await Comment.countDocuments({ issue: issueId });

    const comments = await Comment.find({ issue: issueId })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean();

    res.status(200).json({
        success: true,
        count: comments.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: comments,
    });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner or Admin)
export const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    // Check ownership or admin
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'Not authorized to delete this comment');
    }

    // Decrement comments count on issue
    await Issue.findByIdAndUpdate(comment.issue, { $inc: { commentsCount: -1 } });

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
    });
});
