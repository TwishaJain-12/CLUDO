import { cn } from '../../utils/helpers';

/**
 * Reusable Button Component
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 !text-white focus:ring-primary-500',
        secondary: 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-600 focus:ring-dark-500',
        ghost: 'text-dark-300 hover:text-white hover:bg-dark-700/50 focus:ring-dark-500',
        danger: 'bg-red-600 hover:bg-red-700 !text-white focus:ring-red-500',
        success: 'bg-emerald-600 hover:bg-emerald-700 !text-white focus:ring-emerald-500',
        white: 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-700 border-none shadow-md hover:shadow-lg transition-all',
        blue: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    };

    const sizes = {
        sm: 'text-sm px-3 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2.5 gap-2',
        lg: 'text-base px-6 py-3 gap-2',
        xl: 'text-lg px-8 py-4 gap-3',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 18} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 18} />}
                </>
            )}
        </button>
    );
};

export default Button;
