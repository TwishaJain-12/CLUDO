import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, categoryConfig, truncateText } from '../../utils/helpers';
import Button from '../common/Button';

/**
 * Issue Table Component
 * Admin table view for managing issues
 */
const IssueTable = ({
    issues,
    pagination,
    onPageChange,
    onStatusUpdate,
    onDelete,
    loading = false,
}) => {
    if (issues.length === 0 && !loading) {
        return (
            <div className="bg-dark-800 rounded-xl p-8 text-center text-dark-400">
                No issues found.
            </div>
        );
    }

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-dark-700/50 border-b border-dark-700">
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Issue
                            </th>
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Category
                            </th>
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Status
                            </th>
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Reporter
                            </th>
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Date
                            </th>
                            <th className="text-left px-4 py-3 text-dark-300 font-medium text-sm">
                                Upvotes
                            </th>
                            <th className="text-center px-4 py-3 text-dark-300 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {issues.map((issue) => {
                            const category = categoryConfig[issue.category] || categoryConfig.other;

                            return (
                                <tr
                                    key={issue._id}
                                    className="hover:bg-dark-700/30 transition-colors"
                                >
                                    {/* Issue Title */}
                                    <td className="px-4 py-4">
                                        <div className="max-w-xs">
                                            <Link
                                                to={`/issues/${issue._id}`}
                                                className="text-white font-medium hover:text-primary-400 transition-colors"
                                            >
                                                {truncateText(issue.title, 40)}
                                            </Link>
                                            {issue.location?.address && (
                                                <p className="text-dark-500 text-xs mt-1 truncate">
                                                    {issue.location.address}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${category.bg} ${category.color}`}
                                        >
                                            {category.label}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge status={issue.status} size="sm" />
                                    </td>

                                    {/* Reporter */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs text-white">
                                                {issue.createdBy?.avatar ? (
                                                    <img
                                                        src={issue.createdBy.avatar}
                                                        alt=""
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    issue.createdBy?.name?.[0] || 'U'
                                                )}
                                            </div>
                                            <span className="text-dark-200 text-sm">
                                                {issue.createdBy?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-4 text-dark-400 text-sm">
                                        {formatDate(issue.createdAt)}
                                    </td>

                                    {/* Upvotes */}
                                    <td className="px-4 py-4 text-dark-300 text-sm font-medium">
                                        {issue.upvotesCount}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                to={`/issues/${issue._id}`}
                                                className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <button
                                                onClick={() => onStatusUpdate(issue)}
                                                className="p-2 text-dark-400 hover:text-amber-400 hover:bg-dark-700 rounded-lg transition-colors"
                                                title="Update Status"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(issue._id)}
                                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
                    <p className="text-dark-400 text-sm">
                        Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={ChevronLeft}
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={ChevronRight}
                            iconPosition="right"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueTable;
