import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Eye,
    Flag,
    Clock,
    User,
    AlertTriangle,
    MapPin
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatRelativeTime, categoryConfig, truncateText } from '../../utils/helpers';

/**
 * Report reason labels
 */
const REASON_LABELS = {
    spam: 'Spam',
    inaccurate: 'Inaccurate',
    already_resolved: 'Already Resolved',
    duplicate: 'Duplicate',
    inappropriate: 'Inappropriate',
    other: 'Other',
};

/**
 * Status badge config for reports
 */
const REPORT_STATUS_CONFIG = {
    pending: { bg: 'bg-amber-500/10', color: 'text-amber-400' },
    reviewed: { bg: 'bg-blue-500/10', color: 'text-blue-400' },
    dismissed: { bg: 'bg-dark-600', color: 'text-dark-300' },
    action_taken: { bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
};

/**
 * GroupedReportsTable Component
 * Displays reports grouped by issue with expand/collapse functionality
 */
const GroupedReportsTable = ({
    groupedReports = [],
    pagination = { page: 1, pages: 1, total: 0 },
    stats = {},
    onPageChange,
    onReviewReport,
    loading = false,
}) => {
    const [expandedIssues, setExpandedIssues] = useState({});
    const [showStatsDetails, setShowStatsDetails] = useState(false);

    const toggleExpand = (issueId) => {
        setExpandedIssues((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
        );
    }

    if (!groupedReports.length) {
        return (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flag size={24} className="text-dark-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Reports Found</h3>
                <p className="text-dark-400">
                    No issues have been reported with the current filters.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Bar - Cases with reports breakdown */}
            {stats.totalIssuesReported > 0 && (
                <div className="flex flex-wrap items-center gap-4 p-4 bg-dark-800 border border-dark-700 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Flag size={16} className="text-primary-400" />
                        <span className="text-sm text-dark-300">
                            <strong className="text-white text-lg">{stats.totalIssuesReported}</strong> {stats.totalIssuesReported === 1 ? 'case' : 'cases'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-center px-3">
                            <p className="text-sm font-bold text-white">{stats.totalReports || 0}</p>
                            <p className="text-xs text-dark-400">Reports</p>
                        </div>
                        <div className="w-px h-8 bg-dark-600" />
                        <div className="text-center px-3">
                            <p className="text-sm font-bold text-amber-400">{groupedReports.reduce((acc, g) => acc + g.pendingCount, 0)}</p>
                            <p className="text-xs text-dark-400">Pending</p>
                        </div>
                        <div className="w-px h-8 bg-dark-600" />
                        <div className="text-center px-3">
                            <p className="text-sm font-bold text-emerald-400">{stats.totalReports - groupedReports.reduce((acc, g) => acc + g.pendingCount, 0)}</p>
                            <p className="text-xs text-dark-400">Reviewed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grouped Reports List */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                {groupedReports.map((group) => {
                    const isExpanded = expandedIssues[group._id];
                    const issueCategory = group.issue?.category
                        ? categoryConfig[group.issue.category] || categoryConfig.other
                        : null;

                    return (
                        <div
                            key={group._id}
                            className="border-b border-dark-700 last:border-b-0"
                        >
                            {/* Group Header - Clickable */}
                            <div
                                onClick={() => toggleExpand(group._id)}
                                className="flex items-center gap-4 p-4 hover:bg-dark-700/50 cursor-pointer transition-colors"
                            >
                                {/* Expand Arrow */}
                                <button className="text-dark-400 hover:text-white transition-colors">
                                    {isExpanded ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </button>

                                {/* Report Count Badge */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 text-red-400 font-bold text-lg flex-shrink-0">
                                    {group.reportCount}
                                </div>

                                {/* Issue Preview */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {group.issue ? (
                                            <Link
                                                to={`/issues/${group.issue._id}`}
                                                target="_blank"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-white font-medium hover:text-primary-400 transition-colors flex items-center gap-1 truncate"
                                            >
                                                {truncateText(group.issue.title, 50)}
                                                <ExternalLink size={12} />
                                            </Link>
                                        ) : (
                                            <span className="text-dark-400 italic">Issue Deleted</span>
                                        )}
                                        {issueCategory && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${issueCategory.bg} ${issueCategory.color}`}>
                                                {issueCategory.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-dark-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            Latest: {formatRelativeTime(group.latestReportDate)}
                                        </span>
                                        {group.pendingCount > 0 && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <AlertTriangle size={12} />
                                                {group.pendingCount} pending
                                            </span>
                                        )}
                                        {group.issue?.location?.address && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {truncateText(group.issue.location.address, 25)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Reason Tags */}
                                <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                                    {group.reasons.slice(0, 3).map((reason) => (
                                        <span
                                            key={reason}
                                            className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-dark-300"
                                        >
                                            {REASON_LABELS[reason] || reason}
                                        </span>
                                    ))}
                                    {group.reasons.length > 3 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-dark-300">
                                            +{group.reasons.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Reports */}
                            {isExpanded && (
                                <div className="bg-dark-900/50 px-4 pb-4">
                                    <div className="pl-14 space-y-3">
                                        <h4 className="text-sm font-medium text-dark-400 uppercase tracking-wider pt-2">
                                            All Reports ({group.reportCount})
                                        </h4>
                                        {group.reports.map((report) => {
                                            const statusConfig = REPORT_STATUS_CONFIG[report.status] || REPORT_STATUS_CONFIG.pending;
                                            return (
                                                <div
                                                    key={report._id}
                                                    className="flex items-start gap-3 p-3 bg-dark-800 rounded-lg border border-dark-700"
                                                >
                                                    {/* Reporter Avatar */}
                                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                                        {report.reporter?.avatar ? (
                                                            <img
                                                                src={report.reporter.avatar}
                                                                alt={report.reporter.name}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            report.reporter?.name?.charAt(0)?.toUpperCase() || '?'
                                                        )}
                                                    </div>

                                                    {/* Report Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-white text-sm font-medium">
                                                                {report.reporter?.name || 'Unknown User'}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                                                {report.status === 'action_taken' ? 'Action Taken' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-dark-300 mb-1">
                                                            <span className="text-red-400">{REASON_LABELS[report.reason] || report.reason}</span>
                                                            {report.details && (
                                                                <span className="text-dark-400"> — {report.details}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-dark-500">
                                                            <span>{formatRelativeTime(report.createdAt)}</span>
                                                            {report.reviewedBy?.name && (
                                                                <span className="flex items-center gap-1">
                                                                    <User size={10} />
                                                                    Reviewed by {report.reviewedBy.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {report.reviewNote && (
                                                            <div className="mt-2 p-2 bg-dark-700/50 rounded text-xs text-dark-300">
                                                                <span className="text-dark-500">Note:</span> {report.reviewNote}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Review Button */}
                                                    <button
                                                        onClick={() => onReviewReport({ ...report, issue: group.issue })}
                                                        className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                                                        title="Review Report"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl">
                    <p className="text-sm text-dark-400">
                        Showing <span className="font-medium text-white">{groupedReports.length}</span> of{' '}
                        <span className="font-medium text-white">{pagination.total}</span> reported issues
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-3 py-1 text-sm text-white bg-dark-700 rounded-lg">
                            {pagination.page} / {pagination.pages}
                        </span>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupedReportsTable;
