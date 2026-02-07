/**
 * Loading Spinner Component
 */
const Loader = ({ size = 'md', text = '' }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} relative`}>
                <div className="absolute inset-0 border-4 border-dark-600 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary-500 rounded-full animate-spin border-t-transparent" />
            </div>
            {text && <p className="text-dark-400 text-sm">{text}</p>}
        </div>
    );
};

/**
 * Full Page Loader
 */
export const PageLoader = ({ text = 'Loading...' }) => (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader size="lg" text={text} />
    </div>
);

/**
 * Skeleton Loader for Cards
 */
export const CardSkeleton = () => (
    <div className="bg-dark-800 rounded-xl p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-dark-700 rounded-full" />
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-dark-700 rounded w-3/4" />
                <div className="h-3 bg-dark-700 rounded w-1/2" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-dark-700 rounded" />
            <div className="h-3 bg-dark-700 rounded w-5/6" />
        </div>
        <div className="mt-4 flex gap-4">
            <div className="h-8 bg-dark-700 rounded w-20" />
            <div className="h-8 bg-dark-700 rounded w-20" />
        </div>
    </div>
);

/**
 * Multiple Card Skeletons
 */
export const CardSkeletonList = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

export default Loader;
