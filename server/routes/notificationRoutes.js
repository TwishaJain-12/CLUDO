import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Notification Routes
 * Base path: /api/notifications
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(requireAuth);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAllNotifications);

export default router;
