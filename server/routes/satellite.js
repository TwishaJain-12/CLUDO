import express from 'express';
import { getSatelliteData, generateAuditReport } from '../controllers/satelliteController.js';

const router = express.Router();

// Route to fetch satellite data (tiles/stats)
// Public for now, or add auth middleware if needed
router.get('/data', getSatelliteData);

// Route to generate AI audit report
router.post('/audit', generateAuditReport);

export default router;
