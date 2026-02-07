import express from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Comment Routes
 * Base path: /api
 */

// Get comments for an issue (public)
router.get('/issues/:issueId/comments', getComments);

// Add comment to an issue (private)
router.post('/issues/:issueId/comments', requireAuth, addComment);

// Delete comment (private - owner or admin)
router.delete('/comments/:id', requireAuth, deleteComment);

export default router;
