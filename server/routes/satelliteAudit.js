import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  createSatelliteAudit,
  getAuditByIssue,
  generateCertificate,
  getHistoricalData
} from '../controllers/satelliteAuditController.js';

const router = express.Router();

router.post('/', requireAuth(), createSatelliteAudit);
router.get('/issue/:issueId', getAuditByIssue);
router.get('/:auditId/certificate', generateCertificate);
router.get('/historical', getHistoricalData);

export default router;
