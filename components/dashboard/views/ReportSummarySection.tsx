import React from 'react';
import { motion } from 'framer-motion';

interface ReportSummarySectionProps {
    narrative: any;
    overallScore: number;
    diagnosisCount: number;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const ReportSummarySection = ({ narrative, overallScore, diagnosisCount }: ReportSummarySectionProps) => (
    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ActivityIcon className="w-32 h-32 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Resumen Ejecutivo</h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                {narrative.executiveSummary}
            </p>
            {narrative.behavioralNote && (
                <div className="mt-6 p-4 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-start gap-4">
                    <LightbulbIcon className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-400 italic">
                        {narrative.behavioralNote}
                    </p>
                </div>
            )}
        </div>

        <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="64" cy="64" r="58"
                        fill="none" stroke="currentColor"
                        strokeWidth="8" className="text-slate-800"
                    />
                    <motion.circle
                        cx="64" cy="64" r="58"
                        fill="none" stroke="currentColor"
                        strokeWidth="8" strokeLinecap="round"
                        className="text-indigo-500"
                        initial={{ strokeDasharray: "0 1000" }}
                        animate={{ strokeDasharray: `${(overallScore / 100) * 364} 1000` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{overallScore}%</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Score Global</span>
                </div>
            </div>
            <p className="text-xs text-slate-400 px-4">
                Calculado sobre {diagnosisCount} competencias clave evaluadas.
            </p>
        </div>
    </motion.section>
);

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.922-.606l7-15A1 1 0 0021 0H3a1 1 0 00-.914 1.406l7 15a1 1 0 00.922.606z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v4m0 0H8m4 0h4" />
    </svg>
);
