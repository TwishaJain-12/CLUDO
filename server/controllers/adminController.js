import Issue from '../models/Issue.js';
import User from '../models/User.js';
import IssueReport from '../models/IssueReport.js';
import ReportStats from '../models/ReportStats.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import APIFeatures from '../utils/apiFeatures.js';

/**
 * Admin Controller
 * Handles admin-specific operations
 */

// @desc    Get all issues (admin view with extra details)
// @route   GET /api/admin/issues
// @access  Private (Admin)
export const getAllIssues = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Issue.find(), req.query)
        .filter()
        .search()
        .sort()
        .paginate();

    const total = await Issue.countDocuments(
        new APIFeatures(Issue.find(), req.query).filter().search().query.getFilter()
    );

    const issues = await features.query
        .populate('createdBy', 'name email avatar')
        .populate('statusTimeline.updatedBy', 'name')
        .lean();

    res.status(200).json({
        success: true,
        count: issues.length,
        total,
        page: features.page,
        pages: Math.ceil(total / features.limit),
        data: issues,
    });
});

// @desc    Update issue status (admin only)
// @route   PUT /api/admin/issues/:id/status
// @access  Private (Admin)
export const updateIssueStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    if (!['reported', 'in_progress', 'resolved'].includes(status)) {
        throw new ApiError(400, 'Invalid status value');
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    // Add to status timeline
    issue.statusTimeline.push({
        status,
        updatedAt: new Date(),
        updatedBy: req.user._id,
        note: note || `Status changed to ${status}`,
    });

    issue.status = status;

    await issue.save();

    // Populate for response
    await issue.populate('createdBy', 'name avatar');
    await issue.populate('statusTimeline.updatedBy', 'name');

    res.status(200).json({
        success: true,
        message: `Issue status updated to ${status}`,
        data: issue,
    });
});

// @desc    Mark issue as resolved with proof
// @route   POST /api/admin/issues/:id/resolve
// @access  Private (Admin)
export const resolveIssue = asyncHandler(async (req, res) => {
    const { note } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        throw new ApiError(404, 'Issue not found');
    }

    // Get image URLs from uploaded files
    const images = req.files ? req.files.map((file) => file.path) : [];

    // Update issue with resolution proof
    issue.status = 'resolved';
    issue.resolutionProof = {
        images,
        note: note || 'Issue has been resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
    };

    // Add to status timeline
    issue.statusTimeline.push({
        status: 'resolved',
        updatedAt: new Date(),
        updatedBy: req.user._id,
        note: note || 'Issue resolved with proof',
    });

    await issue.save();

    // Populate for response
    await issue.populate('createdBy', 'name avatar');
    await issue.populate('resolutionProof.resolvedBy', 'name');

    res.status(200).json({
        success: true,
        message: 'Issue marked as resolved',
        data: issue,
    });
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req, res) => {
    // Get date range (default: last 30 days)
    const days = parseInt(req.query.days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total counts
    const totalIssues = await Issue.countDocuments();
    const totalUsers = await User.countDocuments();

    // Status breakdown
    const statusCounts = await Issue.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Category breakdown
    const categoryCounts = await Issue.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    // Issues over time (last N days) with status breakdown
    const issuesOverTime = await Issue.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                total: { $sum: 1 },
                reported: {
                    $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] }
                },
                in_progress: {
                    $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                },
                resolved: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Trending issues (most upvoted in time period)
    const trendingIssues = await Issue.find({ createdAt: { $gte: startDate } })
        .sort('-upvotesCount')
        .limit(10)
        .select('title category status upvotesCount commentsCount createdAt')
        .lean();

    // Resolution rate
    const resolvedCount = statusCounts.find((s) => s._id === 'resolved')?.count || 0;
    const resolutionRate = totalIssues > 0 ? ((resolvedCount / totalIssues) * 100).toFixed(1) : 0;

    // Hotspot locations (areas with most issues)
    const hotspots = await Issue.aggregate([
        {
            $match: {
                'location.address': { $exists: true, $ne: '' },
            },
        },
        {
            $group: {
                _id: '$location.address',
                count: { $sum: 1 },
                avgLat: { $avg: { $arrayElemAt: ['$location.coordinates', 1] } },
                avgLng: { $avg: { $arrayElemAt: ['$location.coordinates', 0] } },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    // Recent activity
    const recentIssues = await Issue.find()
        .sort('-createdAt')
        .limit(5)
        .select('title category status createdAt')
        .lean();

    res.status(200).json({
        success: true,
        data: {
            overview: {
                totalIssues,
                totalUsers,
                resolutionRate: parseFloat(resolutionRate),
                reportedToday: await Issue.countDocuments({
                    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
                }),
            },
            statusBreakdown: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            categoryBreakdown: categoryCounts,
            issuesOverTime,
            trendingIssues,
            hotspots,
            recentIssues,
        },
    });
});

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean();

    // Get issue counts per user
    const usersWithStats = await Promise.all(
        users.map(async (user) => {
            const issueCount = await Issue.countDocuments({ createdBy: user._id });
            return { ...user, issueCount };
        })
    );

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: usersWithStats,
    });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        throw new ApiError(400, 'Invalid role value');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        data: user,
    });
});

// ============================================
// REPORT MANAGEMENT
// ============================================

// @desc    Get all reports (admin only)
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getAllReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status, reason, category, issueStatus, search } = req.query;

    // Build base filter for reports
    const reportFilter = {};
    if (status) reportFilter.status = status;
    if (reason) reportFilter.reason = reason;

    // Build aggregation pipeline to filter by issue properties
    const pipeline = [
        // Match report filters first
        { $match: reportFilter },
        // Lookup issue details
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $unwind: { path: '$issueData', preserveNullAndEmptyArrays: true } },
    ];

    // Add issue-based filters
    if (category) {
        pipeline.push({ $match: { 'issueData.category': category } });
    }
    if (issueStatus) {
        pipeline.push({ $match: { 'issueData.status': issueStatus } });
    }
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { 'issueData.title': { $regex: search, $options: 'i' } },
                    { 'issueData.description': { $regex: search, $options: 'i' } },
                    { details: { $regex: search, $options: 'i' } }
                ]
            }
        });
    }

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await IssueReport.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        // Lookup reporter
        {
            $lookup: {
                from: 'users',
                localField: 'reporter',
                foreignField: '_id',
                as: 'reporterData'
            }
        },
        { $unwind: { path: '$reporterData', preserveNullAndEmptyArrays: true } },
        // Lookup reviewedBy
        {
            $lookup: {
                from: 'users',
                localField: 'reviewedBy',
                foreignField: '_id',
                as: 'reviewedByData'
            }
        },
        { $unwind: { path: '$reviewedByData', preserveNullAndEmptyArrays: true } },
        // Project final shape
        {
            $project: {
                _id: 1,
                reason: 1,
                details: 1,
                status: 1,
                reviewNote: 1,
                reviewedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                issue: {
                    _id: '$issueData._id',
                    title: '$issueData.title',
                    category: '$issueData.category',
                    status: '$issueData.status',
                    images: '$issueData.images',
                    location: '$issueData.location',
                    createdAt: '$issueData.createdAt'
                },
                reporter: {
                    _id: '$reporterData._id',
                    name: '$reporterData.name',
                    email: '$reporterData.email',
                    avatar: '$reporterData.avatar'
                },
                reviewedBy: {
                    _id: '$reviewedByData._id',
                    name: '$reviewedByData.name'
                }
            }
        }
    );

    const reports = await IssueReport.aggregate(pipeline);

    // Get report counts by status for overview
    const statusCounts = await IssueReport.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
        success: true,
        count: reports.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        statusCounts: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        data: reports,
    });
});

// @desc    Get reports grouped by issue (admin only)
// @route   GET /api/admin/reports/grouped
// @access  Private (Admin)
export const getGroupedReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const {
        status,
        category,
        issueStatus,
        search,
        minReports = 1,
        sortBy = 'reportCount' // reportCount, newest, oldest
    } = req.query;

    // Build base filter for reports
    const reportFilter = {};
    if (status && status !== 'all') reportFilter.status = status;

    // Build aggregation pipeline
    const pipeline = [
        // Match report filters first
        { $match: reportFilter },
        // Lookup issue details
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        // Only keep reports where the issue still exists (filter out orphaned reports)
        { $unwind: '$issueData' },
    ];

    // Add issue-based filters
    if (category) {
        pipeline.push({ $match: { 'issueData.category': category } });
    }
    if (issueStatus) {
        pipeline.push({ $match: { 'issueData.status': issueStatus } });
    }
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { 'issueData.title': { $regex: search, $options: 'i' } },
                    { 'issueData.description': { $regex: search, $options: 'i' } },
                    { details: { $regex: search, $options: 'i' } }
                ]
            }
        });
    }

    // Lookup reporter data for each report
    pipeline.push(
        {
            $lookup: {
                from: 'users',
                localField: 'reporter',
                foreignField: '_id',
                as: 'reporterData'
            }
        },
        { $unwind: { path: '$reporterData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'reviewedBy',
                foreignField: '_id',
                as: 'reviewedByData'
            }
        },
        { $unwind: { path: '$reviewedByData', preserveNullAndEmptyArrays: true } }
    );

    // Group by issue
    pipeline.push({
        $group: {
            _id: '$issue',
            issue: { $first: '$issueData' },
            reportCount: { $sum: 1 },
            pendingCount: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            latestReportDate: { $max: '$createdAt' },
            reasons: { $addToSet: '$reason' },
            reports: {
                $push: {
                    _id: '$_id',
                    reason: '$reason',
                    details: '$details',
                    status: '$status',
                    createdAt: '$createdAt',
                    reviewNote: '$reviewNote',
                    reviewedAt: '$reviewedAt',
                    reporter: {
                        _id: '$reporterData._id',
                        name: '$reporterData.name',
                        email: '$reporterData.email',
                        avatar: '$reporterData.avatar'
                    },
                    reviewedBy: {
                        _id: '$reviewedByData._id',
                        name: '$reviewedByData.name'
                    }
                }
            }
        }
    });

    // Filter by minimum report count
    const minReportsNum = parseInt(minReports, 10) || 1;
    if (minReportsNum > 1) {
        pipeline.push({ $match: { reportCount: { $gte: minReportsNum } } });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await IssueReport.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add sorting
    let sortStage = {};
    switch (sortBy) {
        case 'reportCount':
            sortStage = { reportCount: -1, latestReportDate: -1 };
            break;
        case 'newest':
            sortStage = { latestReportDate: -1 };
            break;
        case 'oldest':
            sortStage = { latestReportDate: 1 };
            break;
        case 'pendingFirst':
            sortStage = { pendingCount: -1, reportCount: -1 };
            break;
        default:
            sortStage = { reportCount: -1, latestReportDate: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Project final shape
    pipeline.push({
        $project: {
            _id: 1,
            issue: {
                _id: '$issue._id',
                title: '$issue.title',
                category: '$issue.category',
                status: '$issue.status',
                images: '$issue.images',
                location: '$issue.location',
                createdAt: '$issue.createdAt'
            },
            reportCount: 1,
            pendingCount: 1,
            latestReportDate: 1,
            reasons: 1,
            reports: 1
        }
    });

    const groupedReports = await IssueReport.aggregate(pipeline);

    // Get overall stats - only count reports for issues that still exist
    const stats = await IssueReport.aggregate([
        // First, lookup to check if issue exists
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        // Only keep reports where the issue still exists
        { $match: { issueData: { $ne: [] } } },
        {
            $group: {
                _id: '$issue',
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                totalIssuesReported: { $sum: 1 },
                totalReports: { $sum: '$count' },
                multipleReports: {
                    $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] }
                }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        count: groupedReports.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        stats: stats[0] || { totalIssuesReported: 0, totalReports: 0, multipleReports: 0 },
        data: groupedReports,
    });
});

// @desc    Get single report by ID
// @route   GET /api/admin/reports/:id
// @access  Private (Admin)
export const getReportById = asyncHandler(async (req, res) => {
    const report = await IssueReport.findById(req.params.id)
        .populate({
            path: 'issue',
            populate: { path: 'createdBy', select: 'name email avatar' }
        })
        .populate('reporter', 'name email avatar')
        .populate('reviewedBy', 'name');

    if (!report) {
        throw new ApiError(404, 'Report not found');
    }

    // Get total reports for this issue
    const totalReportsForIssue = await IssueReport.countDocuments({
        issue: report.issue._id
    });

    res.status(200).json({
        success: true,
        data: {
            ...report.toObject(),
            totalReportsForIssue,
        },
    });
});

// @desc    Review a report (mark as reviewed, dismissed, or action_taken)
// @route   PUT /api/admin/reports/:id/review
// @access  Private (Admin)
export const reviewReport = asyncHandler(async (req, res) => {
    const { status, reviewNote, deleteIssue } = req.body;

    if (!['reviewed', 'dismissed', 'action_taken'].includes(status)) {
        throw new ApiError(400, 'Invalid status. Must be reviewed, dismissed, or action_taken');
    }

    const report = await IssueReport.findById(req.params.id).populate('issue');

    if (!report) {
        throw new ApiError(404, 'Report not found');
    }

    const issueTitle = report.issue?.title || 'an issue';
    const issueOwnerId = report.issue?.createdBy;

    // Update report status
    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewNote = reviewNote || '';
    report.reviewedAt = new Date();

    await report.save();

    // Create notification for the reporter
    const notificationTypeForReporter = status === 'dismissed' ? 'report_dismissed' : 'report_reviewed';
    const actionLabel = status === 'action_taken' ? 'Action was taken' :
        status === 'dismissed' ? 'Dismissed' : 'Reviewed';

    await Notification.createNotification({
        userId: report.reporter,
        type: notificationTypeForReporter,
        title: `Report ${actionLabel}`,
        message: `Your report on "${issueTitle}" has been ${actionLabel.toLowerCase()}.${reviewNote ? ` Admin note: ${reviewNote}` : ''}`,
        data: {
            issueId: report.issue?._id,
            reportId: report._id,
            action: status,
        },
    });

    // If admin chooses to delete the issue
    if (deleteIssue && status === 'action_taken') {
        const issue = await Issue.findById(report.issue._id);
        if (issue) {
            // Notify the issue owner about deletion
            if (issueOwnerId && issueOwnerId.toString() !== report.reporter.toString()) {
                await Notification.createNotification({
                    userId: issueOwnerId,
                    type: 'issue_deleted',
                    title: 'Issue Removed',
                    message: `Your issue "${issueTitle}" was removed due to community reports.${reviewNote ? ` Note: ${reviewNote}` : ''}`,
                    data: {
                        issueId: report.issue._id,
                        action: 'deleted',
                    },
                });
            }

            // Delete all reports for this issue (they're no longer needed)
            await IssueReport.deleteMany({ issue: report.issue._id });

            // Delete the issue
            await Issue.findByIdAndDelete(report.issue._id);
        }

        // Track stats for action_taken with issue deletion
        await ReportStats.incrementStats('action_taken', report.reason, true);

        res.status(200).json({
            success: true,
            message: 'Report reviewed and issue deleted',
            data: { deleted: true },
        });
        return;
    } else if (status === 'reviewed' && issueOwnerId) {
        // Send a warning to issue owner if report is reviewed but not dismissed
        // Only if they have multiple reports on this issue
        const reportCountForIssue = await IssueReport.countDocuments({ issue: report.issue._id });
        if (reportCountForIssue >= 2) {
            await Notification.createNotification({
                userId: issueOwnerId,
                type: 'issue_warning',
                title: 'Issue Received Reports',
                message: `Your issue "${issueTitle}" has received ${reportCountForIssue} community reports. Please review our guidelines.`,
                data: {
                    issueId: report.issue._id,
                    action: 'warning',
                },
            });
        }
    }

    // Track stats before deleting (reviewed or dismissed)
    await ReportStats.incrementStats(status, report.reason, false);

    // Delete the report after it's been reviewed (auto-cleanup)
    await IssueReport.findByIdAndDelete(report._id);

    res.status(200).json({
        success: true,
        message: `Report ${status === 'dismissed' ? 'dismissed' : 'reviewed'} and removed`,
        data: { deleted: true, status },
    });
});

// @desc    Dismiss a report
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin)
export const dismissReport = asyncHandler(async (req, res) => {
    const report = await IssueReport.findById(req.params.id);

    if (!report) {
        throw new ApiError(404, 'Report not found');
    }

    // Mark as dismissed instead of deleting (for audit purposes)
    report.status = 'dismissed';
    report.reviewedBy = req.user._id;
    report.reviewNote = req.body.note || 'Dismissed by admin';
    report.reviewedAt = new Date();

    await report.save();

    res.status(200).json({
        success: true,
        message: 'Report dismissed',
        data: report,
    });
});

// @desc    Get report analytics
// @route   GET /api/admin/reports/analytics
// @access  Private (Admin)
export const getReportAnalytics = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total counts (all reports including orphaned)
    const totalReports = await IssueReport.countDocuments();

    // Count orphaned reports (reports for deleted issues)
    const orphanedReportsAgg = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        {
            $match: { issueData: { $size: 0 } }
        },
        { $count: 'count' }
    ]);
    const orphanedReports = orphanedReportsAgg[0]?.count || 0;

    // Active reports (reports for issues that still exist)
    const activeReports = totalReports - orphanedReports;

    // Count active cases (unique issues with active reports)
    const activeCasesAgg = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $group: { _id: '$issue' } },
        { $count: 'count' }
    ]);
    const activeCases = activeCasesAgg[0]?.count || 0;

    // Count pending reports (only for issues that still exist)
    const pendingReportsAgg = await IssueReport.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $count: 'count' }
    ]);
    const pendingReports = pendingReportsAgg[0]?.count || 0;

    // Count pending cases (unique issues with pending reports)
    const pendingCasesAgg = await IssueReport.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $group: { _id: '$issue' } },
        { $count: 'count' }
    ]);
    const pendingCases = pendingCasesAgg[0]?.count || 0;

    // Reports by reason (only for active reports - issues that exist)
    const reasonCounts = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Reports by status (only for active reports)
    const statusCounts = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Reports over time (only for active reports)
    const reportsOverTime = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] }, createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Most reported issues (only for existing issues)
    const mostReportedIssues = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        { $match: { issueData: { $ne: [] } } },
        { $group: { _id: '$issue', reportCount: { $sum: 1 } } },
        { $sort: { reportCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'issues',
                localField: '_id',
                foreignField: '_id',
                as: 'issue'
            }
        },
        { $unwind: '$issue' },
        {
            $project: {
                _id: 1,
                reportCount: 1,
                'issue.title': 1,
                'issue.category': 1,
                'issue.status': 1
            }
        }
    ]);

    // Count reviewed today (for active reports)
    const reviewedTodayAgg = await IssueReport.aggregate([
        {
            $lookup: {
                from: 'issues',
                localField: 'issue',
                foreignField: '_id',
                as: 'issueData'
            }
        },
        {
            $match: {
                issueData: { $ne: [] },
                reviewedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        },
        { $count: 'count' }
    ]);
    const reviewedToday = reviewedTodayAgg[0]?.count || 0;

    // Get cumulative resolved stats
    const resolvedStats = await ReportStats.getStats();

    res.status(200).json({
        success: true,
        data: {
            overview: {
                // Cases = unique issues with reports
                activeCases,
                pendingCases,
                // Reports = individual report submissions
                totalReports,
                activeReports,
                orphanedReports,
                pendingReports,
                reviewedToday,
            },
            // Cumulative resolved stats (historical)
            resolved: {
                total: resolvedStats.totalResolved,
                dismissed: resolvedStats.dismissed,
                reviewed: resolvedStats.reviewed,
                actionTaken: resolvedStats.actionTaken,
                issuesDeleted: resolvedStats.issuesDeleted,
            },
            resolvedByReason: resolvedStats.reasonStats,
            reasonBreakdown: reasonCounts,
            statusBreakdown: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            reportsOverTime,
            mostReportedIssues,
        },
    });
});
