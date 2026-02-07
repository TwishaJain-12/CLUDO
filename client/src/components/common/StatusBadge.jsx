import { statusConfig } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

/**
 * Status Badge Component
 * Displays issue status with appropriate colors
 */
const StatusBadge = ({ status, size = 'md', className = '' }) => {
    const config = statusConfig[status] || statusConfig.reported;

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border',
                config.bg,
                config.color,
                config.border,
                sizes[size],
                className
            )}
        >
            <span
                className={cn(
                    'w-1.5 h-1.5 rounded-full mr-2',
                    status === 'reported' && 'bg-red-400',
                    status === 'in_progress' && 'bg-amber-400',
                    status === 'resolved' && 'bg-emerald-400'
                )}
            />
            {config.label}
        </span>
    );
};

export default StatusBadge;
