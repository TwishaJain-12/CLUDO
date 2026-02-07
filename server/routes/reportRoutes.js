import express from 'express';
import {
    createReport,
    getReportStatus,
    getReportCount,
    getMyReports,
} from '../controllers/reportController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Report Routes
 * Base path: /api/issues/:issueId/report
 * Handles user reports/flags for issues
 */

// Get user's own submitted reports (not nested under issueId)
// This route needs to be mounted at /api/reports in server.js
router.get('/my-reports', requireAuth, getMyReports);

// Submit a report (requires authentication)
router.post('/:issueId/report', requireAuth, createReport);

// Check if current user has reported an issue
router.get('/:issueId/report/status', requireAuth, getReportStatus);

// Get report count for an issue (public)
router.get('/:issueId/report/count', optionalAuth, getReportCount);

export default router;
