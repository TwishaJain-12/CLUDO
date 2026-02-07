import express from 'express';
import {
    getAllIssues,
    updateIssueStatus,
    resolveIssue,
    getAnalytics,
    getAllUsers,
    updateUserRole,
    getAllReports,
    getGroupedReports,
    getReportById,
    reviewReport,
    dismissReport,
    getReportAnalytics,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { uploadResolutionImages } from '../config/cloudinary.js';

const router = express.Router();

/**
 * Admin Routes
 * Base path: /api/admin
 * All routes require authentication and admin role
 */

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Issue management
router.get('/issues', getAllIssues);
router.put('/issues/:id/status', updateIssueStatus);
router.post('/issues/:id/resolve', uploadResolutionImages, resolveIssue);

// Report management
router.get('/reports', getAllReports);
router.get('/reports/grouped', getGroupedReports);
router.get('/reports/analytics', getReportAnalytics);
router.get('/reports/:id', getReportById);
router.put('/reports/:id/review', reviewReport);
router.delete('/reports/:id', dismissReport);

// Analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;

