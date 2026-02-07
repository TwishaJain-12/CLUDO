import Upvote from '../models/Upvote.js';
import Issue from '../models/Issue.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * Upvote Controller
 * Handles upvote/downvote operations on issues
 */

// @desc    Toggle upvote on issue
// @route   POST /api/issues/:issueId/upvote
// @access  Private
export const toggleUpvote = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    // Check if user already upvoted
    const existingUpvote = await Upvote.findOne({
        issue: issueId,
        user: req.user._id,
    });

    if (existingUpvote) {
        // Remove upvote
        await Upvote.findByIdAndDelete(existingUpvote._id);
        await Issue.findByIdAndUpdate(issueId, { $inc: { upvotesCount: -1 } });

        res.status(200).json({
            success: true,
            message: 'Upvote removed',
            data: {
                upvoted: false,
                upvotesCount: issue.upvotesCount - 1,
            },
        });
    } else {
        // Add upvote
        await Upvote.create({
            issue: issueId,
            user: req.user._id,
        });
        await Issue.findByIdAndUpdate(issueId, { $inc: { upvotesCount: 1 } });

        res.status(200).json({
            success: true,
            message: 'Issue upvoted',
            data: {
                upvoted: true,
                upvotesCount: issue.upvotesCount + 1,
            },
        });
    }
});

// @desc    Check if user has upvoted an issue
// @route   GET /api/issues/:issueId/upvote/status
// @access  Private
export const getUpvoteStatus = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    const upvote = await Upvote.findOne({
        issue: issueId,
        user: req.user._id,
    });

    res.status(200).json({
        success: true,
        data: {
            upvoted: !!upvote,
        },
    });
});

// @desc    Get upvote count for an issue
// @route   GET /api/issues/:issueId/upvote/count
// @access  Public
export const getUpvoteCount = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    const count = await Upvote.countDocuments({ issue: issueId });

    res.status(200).json({
        success: true,
        data: {
            count,
        },
    });
});
