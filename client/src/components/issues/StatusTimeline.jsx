import { CheckCircle, Circle, Clock } from 'lucide-react';
import { formatDateTime, statusConfig } from '../../utils/helpers';

/**
 * Status Timeline Component
 * Visual timeline showing issue status progression
 */
const StatusTimeline = ({ timeline = [] }) => {
    if (!timeline || timeline.length === 0) {
        return (
            <div className="text-dark-400 text-sm">No status updates yet.</div>
        );
    }

    // Sort by date (newest last for timeline display)
    const sortedTimeline = [...timeline].sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    const getStatusIcon = (status, isLast) => {
        if (status === 'resolved') {
            return <CheckCircle size={20} className="text-emerald-400" />;
        }
        if (isLast) {
            return <Clock size={20} className="text-amber-400 animate-pulse" />;
        }
        return <Circle size={20} className="text-dark-500" />;
    };

    const getStatusColor = (status) => {
        return statusConfig[status]?.color || 'text-dark-400';
    };

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-dark-700" />

            {/* Timeline items */}
            <div className="space-y-6">
                {sortedTimeline.map((item, index) => {
                    const isLast = index === sortedTimeline.length - 1;

                    return (
                        <div key={index} className="relative flex gap-4">
                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0 bg-dark-800">
                                {getStatusIcon(item.status, isLast)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-2">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`font-medium ${getStatusColor(item.status)}`}>
                                        {statusConfig[item.status]?.label || item.status}
                                    </span>
                                    <span className="text-dark-500 text-sm">
                                        {formatDateTime(item.updatedAt)}
                                    </span>
                                </div>

                                {item.note && (
                                    <p className="text-dark-300 text-sm">{item.note}</p>
                                )}

                                {item.updatedBy && (
                                    <p className="text-dark-500 text-xs mt-1">
                                        By {item.updatedBy.name || 'System'}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
