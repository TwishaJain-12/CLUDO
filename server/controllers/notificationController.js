import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { unreadOnly } = req.query;

    const filter = { user: req.user._id };
    if (unreadOnly === 'true') {
        filter.read = false;
    }

    const [notifications, total] = await Promise.all([
        Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: notifications.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: notifications,
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
        success: true,
        data: { count },
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification,
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
    });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted',
    });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({
        success: true,
        message: 'All notifications cleared',
    });
});
