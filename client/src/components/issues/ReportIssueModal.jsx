import { useState } from 'react';
import { Flag, AlertTriangle, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { reportApi } from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

/**
 * Report reasons configuration
 */
const REPORT_REASONS = [
    { value: 'spam', label: 'Spam or misleading', description: 'This issue appears to be spam or contains misleading information' },
    { value: 'inaccurate', label: 'Inaccurate information', description: 'The details provided are incorrect or outdated' },
    { value: 'already_resolved', label: 'Already resolved', description: 'This issue has already been fixed but not marked as resolved' },
    { value: 'duplicate', label: 'Duplicate issue', description: 'This issue has already been reported by someone else' },
    { value: 'inappropriate', label: 'Inappropriate content', description: 'This issue contains offensive or inappropriate content' },
    { value: 'other', label: 'Other reason', description: 'Report for a reason not listed above' },
];

/**
 * ReportIssueModal Component
 * Modal for users to report/flag issues
 */
const ReportIssueModal = ({ isOpen, onClose, issueId, issueTitle }) => {
    const { isDark } = useTheme();
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedReason) {
            toast.error('Please select a reason for reporting');
            return;
        }

        try {
            setLoading(true);
            await reportApi.submitReport(issueId, {
                reason: selectedReason,
                details: details.trim(),
            });

            toast.success('Report submitted successfully. Our team will review it.');
            handleClose();
        } catch (error) {
            if (error.message?.includes('already reported')) {
                toast.error('You have already reported this issue');
            } else {
                toast.error(error.message || 'Failed to submit report');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedReason('');
        setDetails('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Report Issue"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                {/* Issue Title Reference */}
                {issueTitle && (
                    <div className="mb-6 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
                        <p className="text-sm text-dark-400 mb-1">Reporting:</p>
                        <p className="text-white font-medium line-clamp-2">{issueTitle}</p>
                    </div>
                )}

                {/* Warning Notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-6">
                    <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-amber-400 font-medium">Please report responsibly</p>
                        <p className="text-dark-300 mt-1">
                            False reports may affect your account. Only report issues that genuinely violate our guidelines.
                        </p>
                    </div>
                </div>

                {/* Report Reasons */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-3">
                        Why are you reporting this issue? <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                        {REPORT_REASONS.map((reason) => (
                            <label
                                key={reason.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedReason === reason.value
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : `border-dark-600 hover:border-dark-500 ${isDark ? 'hover:bg-gray-900' : 'hover:bg-dark-200'}`
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason.value}
                                    checked={selectedReason === reason.value}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="mt-1 w-4 h-4 text-primary-600 bg-dark-700 border-dark-500 focus:ring-primary-500 focus:ring-offset-dark-800"
                                />
                                <div>
                                    <p className="text-white font-medium text-sm">{reason.label}</p>
                                    <p className="text-dark-400 text-xs mt-0.5">{reason.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional Details */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">
                        Additional details <span className="text-dark-500">(optional)</span>
                    </label>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Provide any additional context that might help our review team..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-dark-500 mt-1 text-right">{details.length}/500</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        loading={loading}
                        icon={Flag}
                        className="flex-1"
                    >
                        Submit Report
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ReportIssueModal;
