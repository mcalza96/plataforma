'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, CircleDot, Info } from 'lucide-react';
import { CompetencyDiagnosis, CompetencyEvaluationState } from '../../../lib/domain/evaluation/types';

interface TrafficLightGraphProps {
    diagnoses: CompetencyDiagnosis[];
}

const STATE_CONFIG: Record<CompetencyEvaluationState, {
    color: string;
    icon: React.ReactNode;
    label: string;
    glow: string;
}> = {
    MASTERED: {
        color: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-4 h-4 text-white" />,
        label: 'Dominado',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    },
    GAP: {
        color: 'bg-amber-400',
        icon: <CircleDot className="w-4 h-4 text-white" />,
        label: 'Hueco de Conocimiento',
        glow: 'shadow-[0_0_10px_rgba(251,191,36,0.3)] opacity-80',
    },
    MISCONCEPTION: {
        color: 'bg-rose-500',
        icon: <AlertCircle className="w-4 h-4 text-white" />,
        label: 'Error Conceptual',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse',
    },
    UNKNOWN: {
        color: 'bg-slate-400',
        icon: <Info className="w-4 h-4 text-white" />,
        label: 'Sin evidencia',
        glow: '',
    },
};

export const TrafficLightGraph: React.FC<TrafficLightGraphProps> = ({ diagnoses }) => {
    return (
        <div className="p-6 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-indigo-400" />
                Mapa Topológico de Competencias
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {diagnoses.map((diagnosis, index) => {
                    const config = STATE_CONFIG[diagnosis.state];

                    return (
                        <motion.div
                            key={diagnosis.competencyId}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="relative group"
                        >
                            <div className={`
                flex flex-col items-center p-4 rounded-xl 
                bg-slate-800/40 border border-slate-700/50
                hover:border-slate-500/50 transition-all duration-300
                ${diagnosis.state === 'MISCONCEPTION' ? 'ring-1 ring-rose-500/30' : ''}
              `}>
                                {/* Visual Node */}
                                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${config.color} ${config.glow} mb-3
                `}>
                                    {config.icon}
                                </div>

                                {/* Info */}
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                    {diagnosis.competencyId}
                                </span>
                                <span className="text-sm font-semibold text-slate-200 text-center">
                                    {config.label}
                                </span>

                                {/* Hover Details (Tooltip-like) */}
                                <AnimatePresence>
                                    {diagnosis.state === 'MISCONCEPTION' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileHover={{ opacity: 1, y: 0 }}
                                            className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 p-2 
                               bg-rose-950/90 text-rose-100 text-[10px] rounded-lg
                               border border-rose-500/50 backdrop-blur-sm
                               opacity-0 group-hover:opacity-100 pointer-events-none
                               z-10 shadow-xl"
                                        >
                                            <p className="font-bold mb-1">DETECTOR DE BUGS:</p>
                                            {diagnosis.evidence.reason}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Connector lines (decorative) */}
                            {index < diagnoses.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-slate-800" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-800/50">
                {Object.entries(STATE_CONFIG).map(([state, cfg]) => (
                    <div key={state} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                        <span className="text-xs text-slate-400 capitalize">{cfg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
