import { FileCheck, Download, AlertTriangle, CheckCircle } from 'lucide-react';

const AuditReport = ({ report, loading }) => {
    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-8 border border-slate-700 rounded-xl bg-slate-900/50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-slate-400 font-mono text-sm">Generating Intelligence Report...</span>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl h-full flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <FileCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Audit Certificate</h2>
                        <p className="text-xs text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700">
                    <Download className="w-3 h-3" />
                    Export PDF
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="prose prose-invert prose-sm max-w-none">
                    {/* Simple rendering of the report text which comes from Gemini */}
                    <div className="whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed">
                        {report}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Vertified by TerraTrace AI
                </span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default AuditReport;
