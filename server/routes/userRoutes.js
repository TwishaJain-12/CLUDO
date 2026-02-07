import express from 'express';
import { syncUser, getMe, updateProfile, getUserById } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * User Routes
 * Base path: /api/users
 */

// Private routes
router.post('/sync', requireAuth, syncUser);
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateProfile);

// Public routes
router.get('/:id', getUserById);

export default router;
