import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { notificationApi } from '../services/api';

/**
 * Notification Context
 * Manages notification state and polling for unread count
 */

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { isSignedIn } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            const response = await notificationApi.getUnreadCount();
            if (response.data.success) {
                setUnreadCount(response.data.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [isSignedIn]);

    // Fetch notifications
    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        if (!isSignedIn) return;

        try {
            setLoading(true);
            const response = await notificationApi.getNotifications({
                page: pageNum,
                limit: 10
            });

            if (response.data.success) {
                const newNotifications = response.data.data;
                setNotifications(prev =>
                    append ? [...prev, ...newNotifications] : newNotifications
                );
                setHasMore(response.data.page < response.data.pages);
                setPage(response.data.page);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchNotifications(page + 1, true);
        }
    }, [loading, hasMore, page, fetchNotifications]);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    // Clear all notifications
    const clearAll = useCallback(async () => {
        try {
            await notificationApi.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }, []);

    // Refresh notifications and count
    const refresh = useCallback(() => {
        fetchNotifications(1, false);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Poll for unread count every 30 seconds when signed in
    useEffect(() => {
        if (!isSignedIn) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Initial fetch
        fetchUnreadCount();

        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [isSignedIn, fetchUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications,
        loadMore,
        markAsRead,
        markAllAsRead,
        clearAll,
        refresh,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
