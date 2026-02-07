import mongoose from 'mongoose';

/**
 * User Model
 * Stores user information synced from Clerk
 * Role determines access level: 'user' or 'admin'
 */
const userSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            trim: true,
            default: 'Anonymous User',
        },
        avatar: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
