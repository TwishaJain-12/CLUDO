import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 2.0 Flash as per availability or 1.5

// Mock Satellite Data (Since we don't have a real GEE Service Account active in this env)
// In a real scenario, we would use @google/earthengine or simple REST calls with a service account token.
export const getSatelliteData = async (req, res) => {
    try {
        const { lat, lng, wrong_key } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "Coordinates required" });
        }

        // Mock response simulating NDVI and deforestation confidence
        // This effectively simulates what GEE would return after processing.
        const mockData = {
            location: { lat, lng },
            vegetationIndex: 0.65 + (Math.random() * 0.2 - 0.1), // Random healthy-ish NDVI
            forestCoverPercentage: 75,
            deforestationRisk: "Low",
            lastCloudFreeDate: "2024-01-15",
            analysis: "Healthy vegetation detected consistent with seasonal norms."
        };

        res.status(200).json({ success: true, data: mockData });
    } catch (error) {
        console.error("Satellite Data Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch satellite data" });
    }
};

export const generateAuditReport = async (req, res) => {
    try {
        const { satelliteData } = req.body;

        if (!satelliteData) {
            return res.status(400).json({ success: false, message: "Satellite data required for audit" });
        }

        const prompt = `
      Act as an environmental auditor named "TerraTrace AI".
      Analyze the following satellite telemetry for a location:
      
      Location Criteria:
      - Vegetation Index (NDVI): ${satelliteData.vegetationIndex}
      - Forest Cover: ${satelliteData.forestCoverPercentage}%
      - Risk Level: ${satelliteData.deforestationRisk}
      
      Generate a professional, slightly sci-fi styled environmental audit report. 
      Include sections: "Observation Summary", "Anomaly Detection", and "Recommendation".
      Keep it under 200 words.
    `;

        // Check if API key is present for real generation, else return mock
        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                report: "MOCK AUDIT: Gemini API Key missing. The forest appears healthy with stable NDVI values. No immediate anomalies detected. Recommended action: Continue satellite monitoring."
            });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const report = response.text();

        res.status(200).json({ success: true, report });
    } catch (error) {
        console.error("Gemini Audit Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate audit report" });
    }
};
