import { Link } from 'react-router-dom';
import { Eye, Check, X, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, categoryConfig, truncateText } from '../../utils/helpers';
import Button from '../common/Button';

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
 * Report status config
 */
const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'bg-amber-500/10', color: 'text-amber-400' },
    reviewed: { label: 'Reviewed', bg: 'bg-blue-500/10', color: 'text-blue-400' },
    dismissed: { label: 'Dismissed', bg: 'bg-dark-600', color: 'text-dark-300' },
    action_taken: { label: 'Action Taken', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
};

/**
 * Reports Table Component
 * Admin table view for managing issue reports
 */
const ReportsTable = ({
    reports,
    pagination,
    onPageChange,
    onReview,
    onDismiss,
    loading = false,
}) => {
    if (!reports || reports.length === 0) {
        return (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
                <AlertTriangle size={48} className="text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
                <p className="text-dark-400">
                    There are no issue reports to review at this time.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table Container */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-700/50 border-b border-dark-600">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                    Issue
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                    Reporter
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {reports.map((report) => {
                                const issueCategory = report.issue?.category
                                    ? categoryConfig[report.issue.category] || categoryConfig.other
                                    : null;
                                const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

                                return (
                                    <tr
                                        key={report._id}
                                        className="hover:bg-dark-700/30 transition-colors"
                                    >
                                        {/* Issue */}
                                        <td className="px-4 py-4">
                                            <div className="max-w-xs">
                                                {report.issue ? (
                                                    <>
                                                        <Link
                                                            to={`/issues/${report.issue._id}`}
                                                            className="text-white font-medium hover:text-primary-400 transition-colors line-clamp-1"
                                                        >
                                                            {truncateText(report.issue.title, 40)}
                                                        </Link>
                                                        {issueCategory && (
                                                            <span
                                                                className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full mt-1 ${issueCategory.bg} ${issueCategory.color}`}
                                                            >
                                                                {issueCategory.label}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-dark-400 italic">Issue deleted</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Reporter */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
                                                    {report.reporter?.avatar ? (
                                                        <img
                                                            src={report.reporter.avatar}
                                                            alt={report.reporter.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        report.reporter?.name?.charAt(0) || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">
                                                        {report.reporter?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-dark-400 text-xs">
                                                        {report.reporter?.email || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Reason */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400">
                                                {REASON_LABELS[report.reason] || report.reason}
                                            </span>
                                            {report.details && (
                                                <p className="text-dark-400 text-xs mt-1 line-clamp-1" title={report.details}>
                                                    {truncateText(report.details, 30)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-4 text-dark-400 text-sm">
                                            {formatDate(report.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Review */}
                                                <button
                                                    onClick={() => onReview(report)}
                                                    className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-600 rounded-lg transition-colors"
                                                    title="Review report"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {report.status === 'pending' && (
                                                    <>
                                                        {/* Quick Dismiss */}
                                                        <button
                                                            onClick={() => onDismiss(report._id)}
                                                            className="p-2 text-dark-400 hover:text-amber-400 hover:bg-dark-600 rounded-lg transition-colors"
                                                            title="Dismiss report"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between bg-dark-800 border border-dark-700 rounded-xl px-4 py-3">
                    <p className="text-dark-400 text-sm">
                        Showing {reports.length} of {pagination.total} reports
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </Button>
                        <span className="text-dark-300 text-sm px-3">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                        >
                            Next
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTable;
