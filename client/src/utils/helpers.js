/**
 * Utility Helper Functions
 */

// Format date to readable string
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Format date with time
export const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffInSeconds = Math.floor((now - d) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
};

// Category display names and colors
export const categoryConfig = {
    pothole: { label: 'Pothole', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    garbage: { label: 'Garbage', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    water_leak: { label: 'Water Leak', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    streetlight: { label: 'Streetlight', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    drainage: { label: 'Drainage', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    road_damage: { label: 'Road Damage', color: 'text-gray-300', bg: 'bg-gray-500/50' },
    other: { label: 'Other', color: 'text-gray-300', bg: 'bg-gray-500/50' },
};

// Status display configuration
export const statusConfig = {
    reported: {
        label: 'Reported',
        color: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
    },
    in_progress: {
        label: 'In Progress',
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
    },
    resolved: {
        label: 'Resolved',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
    },
};

// Get category label
export const getCategoryLabel = (category) => {
    return categoryConfig[category]?.label || category;
};

// Get status label
export const getStatusLabel = (status) => {
    return statusConfig[status]?.label || status;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
};

// Validate coordinates
export const isValidCoordinates = (lat, lng) => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

// Format coordinates for display
export const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Generate initials from name
export const getInitials = (name) => {
    if (!name) return 'U';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Format number with K/M suffix
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Class name helper (like clsx)
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};
