import { cn } from '../../utils/helpers';

/**
 * Reusable Card Component
 */
const Card = ({
    children,
    className = '',
    hover = false,
    padding = true,
    ...props
}) => {
    return (
        <div
            className={cn(
                'bg-dark-800 border border-dark-700 rounded-xl',
                padding && 'p-5',
                hover && 'card-hover cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
