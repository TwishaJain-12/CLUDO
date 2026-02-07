import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, X, Trash2, ExternalLink, User, Calendar, Flag, Clock, MessageSquare } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatDate, formatDateTime, categoryConfig, truncateText } from '../../utils/helpers';

/**
 * Report reason labels
 */
const REASON_LABELS = {
    spam: 'Spam or misleading',
    inaccurate: 'Inaccurate information',
    already_resolved: 'Already resolved',
    duplicate: 'Duplicate issue',
    inappropriate: 'Inappropriate content',
    other: 'Other reason',
};

/**
 * Status config for display
 */
const STATUS_CONFIG = {
    pending: { label: 'Pending Review', bg: 'bg-amber-500/10', color: 'text-amber-400', border: 'border-amber-500/20' },
    reviewed: { label: 'Reviewed', bg: 'bg-blue-500/10', color: 'text-blue-400', border: 'border-blue-500/20' },
    dismissed: { label: 'Dismissed', bg: 'bg-dark-600', color: 'text-dark-300', border: 'border-dark-500' },
    action_taken: { label: 'Action Taken', bg: 'bg-emerald-500/10', color: 'text-emerald-400', border: 'border-emerald-500/20' },
};

/**
 * ReportReviewModal Component
 * Modal for admins to review and take action on reports
 */
const ReportReviewModal = ({
    isOpen,
    onClose,
    report,
    onReview,
    onDeleteIssue,
    loading = false,
}) => {
    const [reviewNote, setReviewNote] = useState('');
    const [action, setAction] = useState(null); // 'dismiss', 'reviewed', 'delete'

    // Pre-fill review note if report was already reviewed
    useEffect(() => {
        if (report?.reviewNote) {
            setReviewNote(report.reviewNote);
        } else {
            setReviewNote('');
        }
        setAction(null);
    }, [report]);

    const handleSubmit = async () => {
        if (!action) return;

        if (action === 'delete') {
            await onDeleteIssue(report._id, reviewNote);
        } else {
            const status = action === 'dismiss' ? 'dismissed' : 'reviewed';
            await onReview(report._id, { status, reviewNote });
        }

        handleClose();
    };

    const handleClose = () => {
        setReviewNote('');
        setAction(null);
        onClose();
    };

    if (!report) return null;

    const issueCategory = report.issue?.category
        ? categoryConfig[report.issue.category] || categoryConfig.other
        : null;

    const isAlreadyReviewed = report.status !== 'pending';
    const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isAlreadyReviewed ? "Report Details" : "Review Report"}
            size="lg"
        >
            <div className="space-y-6">
                {/* Previous Review Info - Show only if already reviewed */}
                {isAlreadyReviewed && (
                    <div className={`p-4 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center text-sm px-3 py-1 rounded-full font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                            {report.reviewedAt && (
                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDate(report.reviewedAt)}
                                </span>
                            )}
                        </div>

                        {report.reviewedBy && (
                            <div className="flex items-center gap-2 text-sm text-dark-300 mb-2">
                                <User size={14} />
                                <span>Reviewed by <strong className="text-white">{report.reviewedBy.name || 'Admin'}</strong></span>
                            </div>
                        )}

                        {report.reviewNote && (
                            <div className="mt-3 p-3 bg-dark-800/50 rounded-lg">
                                <div className="flex items-center gap-2 text-xs text-dark-400 mb-2">
                                    <MessageSquare size={12} />
                                    <span>Review Note:</span>
                                </div>
                                <p className="text-white text-sm">{report.reviewNote}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Report Summary */}
                <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                        <Flag size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-medium">
                                {REASON_LABELS[report.reason] || report.reason}
                            </span>
                            {report.totalReportsForIssue > 1 && (
                                <span className="text-xs text-amber-400">
                                    +{report.totalReportsForIssue - 1} other reports
                                </span>
                            )}
                        </div>
                        {report.details && (
                            <p className="text-dark-300 text-sm">{report.details}</p>
                        )}
                        <p className="text-dark-500 text-xs mt-2">
                            Reported by {report.reporter?.name || 'Unknown'} on {formatDate(report.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Reported Issue */}
                <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-3 uppercase tracking-wider">
                        Reported Issue
                    </h4>
                    {report.issue ? (
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <Link
                                        to={`/issues/${report.issue._id}`}
                                        target="_blank"
                                        className="text-white font-semibold hover:text-primary-400 transition-colors flex items-center gap-2"
                                    >
                                        {report.issue.title}
                                        <ExternalLink size={14} />
                                    </Link>
                                    {issueCategory && (
                                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full mt-2 ${issueCategory.bg} ${issueCategory.color}`}>
                                            {issueCategory.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Issue Image Preview */}
                            {report.issue.images && report.issue.images.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                    {report.issue.images.slice(0, 3).map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`Issue ${i + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg border border-dark-600"
                                        />
                                    ))}
                                    {report.issue.images.length > 3 && (
                                        <div className="w-20 h-20 bg-dark-600 rounded-lg flex items-center justify-center text-dark-300 text-sm">
                                            +{report.issue.images.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Issue Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-dark-400 pt-3 border-t border-dark-600">
                                <span className="flex items-center gap-1">
                                    <User size={12} />
                                    {report.issue.createdBy?.name || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(report.issue.createdAt)}
                                </span>
                                {report.issue.location?.address && (
                                    <span className="line-clamp-1">
                                        📍 {truncateText(report.issue.location.address, 30)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-dark-400 italic">This issue has been deleted.</p>
                    )}
                </div>

                {/* Update Section Header */}
                {isAlreadyReviewed && (
                    <div className="border-t border-dark-700 pt-4">
                        <h4 className="text-sm font-medium text-white mb-1">Update Review</h4>
                        <p className="text-xs text-dark-400">You can change the review status or add/update the note</p>
                    </div>
                )}

                {/* Admin Note */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        {isAlreadyReviewed ? 'Update Note' : 'Admin Note'} <span className="text-dark-500">(optional)</span>
                    </label>
                    <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Add a note about your decision..."
                        rows={2}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-white">{isAlreadyReviewed ? 'Change Status:' : 'Take Action:'}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Dismiss */}
                        <button
                            onClick={() => setAction('dismiss')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${action === 'dismiss' || (!action && report.status === 'dismissed')
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                    : 'border-dark-600 hover:border-dark-500 text-dark-300 hover:text-white'
                                }`}
                        >
                            <X size={24} />
                            <span className="text-sm font-medium">Dismiss</span>
                            <span className="text-xs text-dark-400 text-center">
                                Report invalid, keep issue
                            </span>
                        </button>

                        {/* Mark Reviewed */}
                        <button
                            onClick={() => setAction('reviewed')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${action === 'reviewed' || (!action && report.status === 'reviewed')
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-dark-600 hover:border-dark-500 text-dark-300 hover:text-white'
                                }`}
                        >
                            <Check size={24} />
                            <span className="text-sm font-medium">Reviewed</span>
                            <span className="text-xs text-dark-400 text-center">
                                Acknowledge, no action
                            </span>
                        </button>

                        {/* Delete Issue */}
                        {report.issue && (
                            <button
                                onClick={() => setAction('delete')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${action === 'delete' || (!action && report.status === 'action_taken')
                                        ? 'border-red-500 bg-red-500/10 text-red-400'
                                        : 'border-dark-600 hover:border-red-500/50 text-dark-300 hover:text-red-400'
                                    }`}
                            >
                                <Trash2 size={24} />
                                <span className="text-sm font-medium">Delete Issue</span>
                                <span className="text-xs text-dark-400 text-center">
                                    Remove the issue permanently
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Warning for Delete */}
                {action === 'delete' && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-red-400 font-medium">This action is irreversible</p>
                            <p className="text-dark-300 mt-1">
                                Deleting the issue will permanently remove it and all associated data (comments, upvotes, etc.).
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        {isAlreadyReviewed && !action ? 'Close' : 'Cancel'}
                    </Button>
                    <Button
                        variant={action === 'delete' ? 'danger' : 'primary'}
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!action}
                        className="flex-1"
                    >
                        {action === 'delete' ? 'Delete Issue' : action === 'dismiss' ? 'Dismiss Report' : action === 'reviewed' ? 'Mark Reviewed' : 'Select Action'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReportReviewModal;

