import IssueReport from '../models/IssueReport.js';
import Issue from '../models/Issue.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * Report Controller
 * Handles user report operations for issues
 */

// @desc    Create a new report for an issue
// @route   POST /api/issues/:issueId/report
// @access  Private
export const createReport = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { reason, details } = req.body;

    // Validate issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    // Check if user already reported this issue
    const existingReport = await IssueReport.findOne({
        issue: issueId,
        reporter: req.user._id,
    });

    if (existingReport) {
        throw new ApiError(400, 'You have already reported this issue');
    }

    // Prevent users from reporting their own issues
    if (issue.createdBy.toString() === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot report your own issue');
    }

    // Create the report
    const report = await IssueReport.create({
        issue: issueId,
        reporter: req.user._id,
        reason,
        details: details || '',
    });

    res.status(201).json({
        success: true,
        message: 'Issue reported successfully. Our team will review it.',
        data: report,
    });
});

// @desc    Check if user has already reported an issue
// @route   GET /api/issues/:issueId/report/status
// @access  Private
export const getReportStatus = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    const existingReport = await IssueReport.findOne({
        issue: issueId,
        reporter: req.user._id,
    });

    res.status(200).json({
        success: true,
        data: {
            hasReported: !!existingReport,
            report: existingReport || null,
        },
    });
});

// @desc    Get report count for an issue
// @route   GET /api/issues/:issueId/report/count
// @access  Public
export const getReportCount = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    const count = await IssueReport.countDocuments({
        issue: issueId,
    });

    res.status(200).json({
        success: true,
        data: {
            count,
        },
    });
});

// @desc    Get user's submitted reports
// @route   GET /api/reports/my-reports
// @access  Private
export const getMyReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
        IssueReport.find({ reporter: req.user._id })
            .populate('issue', 'title category status images location')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        IssueReport.countDocuments({ reporter: req.user._id }),
    ]);

    res.status(200).json({
        success: true,
        count: reports.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: reports,
    });
});
