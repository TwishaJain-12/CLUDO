import User from '../models/User.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * User Controller
 * Handles user profile operations
 */

// @desc    Sync/create user from Clerk
// @route   POST /api/users/sync
// @access  Private
export const syncUser = asyncHandler(async (req, res) => {
    // User is already created/synced in auth middleware
    const user = req.user;

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateFields,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('name avatar role createdAt');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});
