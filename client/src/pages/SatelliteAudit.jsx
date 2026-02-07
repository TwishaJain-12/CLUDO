import React, { useState } from 'react';
import SatelliteMap from '../components/satellite/SatelliteMap';
import AuditReport from '../components/satellite/AuditReport';
import { Sparkles, Globe, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SatelliteAudit = () => {
    const [selectedLocation, setSelectedLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: New Delhi
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setReport(null);
        try {
            // 1. Fetch "Satellite Data" (Mocked GEE)
            const dataRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/satellite/data`, {
                params: { lat: selectedLocation.lat, lng: selectedLocation.lng }
            });

            if (dataRes.data.success) {
                // 2. Generate Audit Report (Gemini)
                const auditRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/satellite/audit`, {
                    satelliteData: dataRes.data.data
                });

                if (auditRes.data.success) {
                    setReport(auditRes.data.report);
                    toast.success("Audit verification complete");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Analysis failed. Check backend connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="w-6 h-6 text-emerald-500 animate-pulse" />
                        <span className="text-xl font-bold tracking-tight text-white">
                            Terra<span className="text-emerald-500">Trace</span>
                        </span>
                        <span className="hidden md:inline-block ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700">
                            SATELLITE AUDIT PROTOCOL
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            SYSTEM ONLINE
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-4rem)]">

                {/* Left Panel: Controls & Map */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between backdrop-blur-sm">
                        <div>
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                Target Selection
                            </h2>
                            <p className="text-xs text-slate-400">Select area for environmental verification</p>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="group relative px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="flex items-center gap-2 relative z-10">
                                <Sparkles className="w-4 h-4" />
                                {isAnalyzing ? 'ANALYZING...' : 'INITIATE AUDIT'}
                            </span>
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative min-h-[400px]">
                        <SatelliteMap
                            selectedLocation={selectedLocation}
                            onLocationSelect={setSelectedLocation}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>

                {/* Right Panel: Report */}
                <div className="lg:col-span-1 h-full min-h-[400px]">
                    <AuditReport report={report} loading={isAnalyzing} />

                    {!report && !isAnalyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-800 border-dashed rounded-xl bg-slate-900/30">
                            <Globe className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-center text-sm">Select a target on the map and initiate audit to generate intelligence report.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default SatelliteAudit;
