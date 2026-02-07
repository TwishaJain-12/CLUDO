import SatelliteAudit from '../models/SatelliteAudit.js';
import Issue from '../models/Issue.js';
import earthEngineService from '../services/earthEngineService.js';
import geminiAnalysisService from '../services/geminiAnalysisService.js';

export const createSatelliteAudit = async (req, res) => {
  try {
    const { issueId, bounds, timeRange } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);

    // Analyze vegetation using Earth Engine
    const { ndviData, moistureData } = await earthEngineService.analyzeVegetation(
      bounds,
      startDate,
      endDate
    );

    // Get AI analysis from Gemini
    const aiAnalysis = await geminiAnalysisService.analyzeEnvironmentalData(
      ndviData,
      moistureData,
      issue.location,
      issue.description
    );

    // Check for leakage
    const leakageResult = await earthEngineService.detectLeakage(
      issue.location.coordinates[1],
      issue.location.coordinates[0]
    );
    aiAnalysis.leakageDetected = leakageResult.detected;

    const audit = new SatelliteAudit({
      issueId,
      location: issue.location,
      bounds,
      timeRange: { start: startDate, end: endDate },
      ndviData,
      moistureData,
      aiAnalysis,
      status: 'completed'
    });

    await audit.save();

    res.status(201).json({
      success: true,
      audit
    });
  } catch (error) {
    console.error('Satellite audit error:', error);
    res.status(500).json({ error: 'Failed to create satellite audit' });
  }
};

export const getAuditByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const audits = await SatelliteAudit.find({ issueId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      audits
    });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
};

export const generateCertificate = async (req, res) => {
  try {
    const { auditId } = req.params;
    
    const audit = await SatelliteAudit.findById(auditId);
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const certificateText = await geminiAnalysisService.generateAuditCertificate({
      location: `${audit.location.coordinates[1]}, ${audit.location.coordinates[0]}`,
      timeRange: audit.timeRange,
      aiAnalysis: audit.aiAnalysis
    });

    res.json({
      success: true,
      certificate: certificateText
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const getHistoricalData = async (req, res) => {
  try {
    const { lat, lon, startDate, endDate } = req.query;

    const bounds = {
      north: parseFloat(lat) + 0.01,
      south: parseFloat(lat) - 0.01,
      east: parseFloat(lon) + 0.01,
      west: parseFloat(lon) - 0.01
    };

    const { ndviData, moistureData } = await earthEngineService.analyzeVegetation(
      bounds,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: { ndviData, moistureData }
    });
  } catch (error) {
    console.error('Historical data error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};
