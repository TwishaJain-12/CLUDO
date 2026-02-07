import express from 'express';
import { toggleUpvote, getUpvoteStatus, getUpvoteCount } from '../controllers/upvoteController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Upvote Routes
 * Base path: /api/issues/:issueId/upvote
 */

// Toggle upvote (private)
router.post('/:issueId/upvote', requireAuth, toggleUpvote);

// Get upvote status for current user (private)
router.get('/:issueId/upvote/status', requireAuth, getUpvoteStatus);

// Get upvote count (public)
router.get('/:issueId/upvote/count', getUpvoteCount);

export default router;
