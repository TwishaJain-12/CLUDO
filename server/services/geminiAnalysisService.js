import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    // Try multiple model names in order of preference (with correct models/ prefix)
    const modelNames = ['models/gemini-2.5-flash', 'models/gemini-2.0-flash', 'models/gemini-pro-latest'];
    
    for (const modelName of modelNames) {
      try {
        const testModel = this.genAI.getGenerativeModel({ model: modelName });
        // Test if model works with a simple request
        await testModel.generateContent("Test");
        this.model = testModel;
        console.log(`✅ Gemini model initialized: ${modelName}`);
        return;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }
    
    console.error('❌ All Gemini models failed to initialize');
    this.model = null;
  }

  async analyzeEnvironmentalData(ndviData, moistureData, location, issueDescription) {
    try {
      // Ensure model is initialized
      if (!this.model) {
        await this.initializeModel();
      }
      
      // If still no model, use fallback
      if (!this.model) {
        console.log('No Gemini model available, using fallback analysis');
        return this.generateFallbackAnalysis(ndviData);
      }

      const prompt = `You are an environmental auditor analyzing satellite data for a civic issue report.

Location: ${location.coordinates[1]}, ${location.coordinates[0]}
Issue Description: ${issueDescription}

NDVI Data (Vegetation Health):
${ndviData.map(d => `Date: ${d.date.toISOString().split('T')[0]}, Mean NDVI: ${d.mean.toFixed(3)}`).join('\n')}

Moisture Data:
${moistureData.map(d => `Date: ${d.date.toISOString().split('T')[0]}, Moisture: ${d.mean.toFixed(3)}`).join('\n')}

Analysis Guidelines:
- NDVI > 0.6: Healthy vegetation
- NDVI 0.3-0.6: Moderate vegetation
- NDVI < 0.3: Sparse/degraded vegetation
- Declining NDVI trend indicates deforestation or degradation

Provide a comprehensive analysis in JSON format:
{
  "summary": "Brief 2-3 sentence summary",
  "riskLevel": "low|medium|high|critical",
  "deforestationDetected": boolean,
  "vegetationHealth": "Description of current vegetation state",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "confidence": 0.0-1.0
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return this.generateFallbackAnalysis(ndviData);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.generateFallbackAnalysis(ndviData);
    }
  }

  generateFallbackAnalysis(ndviData) {
    const latestNDVI = ndviData[ndviData.length - 1]?.mean || 0;
    const firstNDVI = ndviData[0]?.mean || 0;
    const trend = latestNDVI - firstNDVI;

    let riskLevel = 'low';
    let deforestationDetected = false;

    if (latestNDVI < 0.3 || trend < -0.2) {
      riskLevel = 'critical';
      deforestationDetected = true;
    } else if (latestNDVI < 0.4 || trend < -0.1) {
      riskLevel = 'high';
    } else if (latestNDVI < 0.5) {
      riskLevel = 'medium';
    }

    return {
      summary: `Vegetation analysis shows ${deforestationDetected ? 'significant degradation' : 'stable conditions'} with NDVI of ${latestNDVI.toFixed(2)}.`,
      riskLevel,
      deforestationDetected,
      vegetationHealth: latestNDVI > 0.6 ? 'Healthy' : latestNDVI > 0.4 ? 'Moderate' : 'Degraded',
      recommendations: [
        'Continue monitoring vegetation trends',
        'Verify findings with ground truth data',
        'Consider local environmental factors'
      ],
      confidence: 0.75
    };
  }

  async generateAuditCertificate(auditData) {
    // Ensure model is initialized
    if (!this.model) {
      await this.initializeModel();
    }
    
    const prompt = `Generate a formal environmental audit certificate summary for:

Location: ${auditData.location}
Analysis Period: ${auditData.timeRange.start} to ${auditData.timeRange.end}
Risk Level: ${auditData.aiAnalysis.riskLevel}
Deforestation Detected: ${auditData.aiAnalysis.deforestationDetected ? 'Yes' : 'No'}

Create a professional 3-paragraph certificate text suitable for official documentation.`;

    try {
      if (this.model) {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } else {
        throw new Error('No Gemini model available');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      return `Environmental Audit Certificate\n\nThis certifies that satellite analysis was conducted for the specified location during the period ${auditData.timeRange.start} to ${auditData.timeRange.end}. The analysis indicates a ${auditData.aiAnalysis.riskLevel} risk level.\n\nFurther investigation is recommended.`;
    }
  }
}

export default new GeminiAnalysisService();
