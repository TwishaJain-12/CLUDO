import mongoose from 'mongoose';

const satelliteAuditSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  bounds: {
    north: Number,
    south: Number,
    east: Number,
    west: Number
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  timeRange: {
    start: Date,
    end: Date
  },
  ndviData: [{
    date: Date,
    mean: Number,
    min: Number,
    max: Number,
    stdDev: Number
  }],
  moistureData: [{
    date: Date,
    mean: Number
  }],
  aiAnalysis: {
    summary: String,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    deforestationDetected: Boolean,
    vegetationHealth: String,
    leakageDetected: Boolean,
    recommendations: [String],
    confidence: Number
  },
  satelliteImages: [{
    date: Date,
    url: String,
    type: String
  }],
  certificateUrl: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

satelliteAuditSchema.index({ location: '2dsphere' });
satelliteAuditSchema.index({ issueId: 1 });

export default mongoose.model('SatelliteAudit', satelliteAuditSchema);
