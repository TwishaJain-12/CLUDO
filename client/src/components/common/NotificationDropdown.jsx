import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, Flag, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/helpers';

/**
 * Notification type icon mapping
 */
const getNotificationIcon = (type) => {
    switch (type) {
        case 'report_reviewed':
            return <CheckCircle size={16} className="text-blue-400" />;
        case 'report_dismissed':
            return <X size={16} className="text-dark-400" />;
        case 'issue_warning':
            return <AlertTriangle size={16} className="text-amber-400" />;
        case 'issue_deleted':
            return <Trash2 size={16} className="text-red-400" />;
        case 'issue_resolved':
            return <CheckCircle size={16} className="text-emerald-400" />;
        default:
            return <MessageSquare size={16} className="text-primary-400" />;
    }
};

/**
 * Get background color based on notification type
 */
const getNotificationBg = (type, read) => {
    if (read) return 'bg-dark-800';

    switch (type) {
        case 'issue_warning':
            return 'bg-amber-500/5 border-l-2 border-amber-500';
        case 'issue_deleted':
            return 'bg-red-500/5 border-l-2 border-red-500';
        case 'report_reviewed':
            return 'bg-blue-500/5 border-l-2 border-blue-500';
        default:
            return 'bg-dark-700/50';
    }
};

/**
 * NotificationDropdown Component
 * Bell icon with dropdown showing recent notifications
 */
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            fetchNotifications();
        }
    }, [isOpen, notifications.length, fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell size={32} className="text-dark-600 mx-auto mb-2" />
                                <p className="text-dark-400 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-dark-700 last:border-b-0 cursor-pointer hover:bg-dark-700/50 transition-colors ${getNotificationBg(notification.type, notification.read)}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${notification.read ? 'text-dark-300' : 'text-white'}`}>
                                                {notification.title}
                                            </p>
                                            <p className={`text-sm mt-0.5 line-clamp-2 ${notification.read ? 'text-dark-500' : 'text-dark-300'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-dark-500 mt-1">
                                                {formatRelativeTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-dark-700 bg-dark-900/50">
                        <Link
                            to="/profile?tab=notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
