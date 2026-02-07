import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SatelliteAuditViewer = ({ issueId, location }) => {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const startAudit = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 2);

      const bounds = {
        north: location.coordinates[1] + 0.01,
        south: location.coordinates[1] - 0.01,
        east: location.coordinates[0] + 0.01,
        west: location.coordinates[0] - 0.01
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/satellite-audit`,
        {
          issueId,
          bounds,
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      );

      setAudit(response.data.audit);
      toast.success('Satellite audit completed!');
    } catch (error) {
      console.error('Audit error:', error);
      toast.error('Failed to complete satellite audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExistingAudit = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/satellite-audit/issue/${issueId}`
        );
        if (response.data.audits && response.data.audits.length > 0) {
          setAudit(response.data.audits[0]);
        }
      } catch (error) {
        console.error('Fetch audit error:', error);
      }
    };

    fetchExistingAudit();
  }, [issueId]);

  const getRiskColor = (riskLevel) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500'
    };
    return colors[riskLevel] || 'text-gray-500';
  };

  const getRiskBg = (riskLevel) => {
    const colors = {
      low: 'bg-green-500/10',
      medium: 'bg-yellow-500/10',
      high: 'bg-orange-500/10',
      critical: 'bg-red-500/10'
    };
    return colors[riskLevel] || 'bg-gray-500/10';
  };

  if (!audit && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center"
      >
        <Satellite className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
        <h3 className="text-xl font-bold mb-2">Satellite Environmental Audit</h3>
        <p className="text-gray-600 mb-6">
          Analyze this location using AI-powered satellite imagery and vegetation health monitoring
        </p>
        <button
          onClick={startAudit}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Satellite Analysis
        </button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing satellite data...</p>
      </div>
    );
  }

  const currentNDVI = audit?.ndviData[timelineIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* AI Analysis Summary */}
      <div className={`${getRiskBg(audit.aiAnalysis.riskLevel)} rounded-xl p-6 border-2 ${getRiskColor(audit.aiAnalysis.riskLevel).replace('text-', 'border-')}`}>
        <div className="flex items-start gap-4">
          {audit.aiAnalysis.deforestationDetected ? (
            <AlertTriangle className={`w-8 h-8 ${getRiskColor(audit.aiAnalysis.riskLevel)}`} />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-500" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold">AI Analysis</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(audit.aiAnalysis.riskLevel)} ${getRiskBg(audit.aiAnalysis.riskLevel)}`}>
                {audit.aiAnalysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-gray-700 mb-3">{audit.aiAnalysis.summary}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Vegetation Health:</span> {audit.aiAnalysis.vegetationHealth}
              </div>
              <div>
                <span className="font-semibold">Confidence:</span> {(audit.aiAnalysis.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="bg-white rounded-xl p-6">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Historical Timeline
        </h4>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max={audit.ndviData.length - 1}
            value={timelineIndex}
            onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{new Date(audit.ndviData[0].date).toLocaleDateString()}</span>
            <span className="font-semibold">
              {new Date(currentNDVI.date).toLocaleDateString()}
            </span>
            <span>{new Date(audit.ndviData[audit.ndviData.length - 1].date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* NDVI Display */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">NDVI Value</div>
            <div className="text-2xl font-bold text-green-600">
              {currentNDVI.mean.toFixed(3)}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Min</div>
            <div className="text-xl font-bold text-blue-600">
              {currentNDVI.min.toFixed(3)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Max</div>
            <div className="text-xl font-bold text-purple-600">
              {currentNDVI.max.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl p-6">
        <h4 className="font-bold mb-4">Recommendations</h4>
        <ul className="space-y-2">
          {audit.aiAnalysis.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Certificate Button */}
      <button
        onClick={() => setShowCertificate(true)}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
      >
        Generate Audit Certificate
      </button>
    </motion.div>
  );
};

export default SatelliteAuditViewer;
