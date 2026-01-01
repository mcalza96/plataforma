"use client";

import React, { useState, useMemo } from 'react';
import { ShieldAlert, Info, X, ChevronRight, MessageSquareCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompetencyEvaluationState } from '@/lib/domain/evaluation/types';
import { CohortAnalytics } from '@/lib/actions/admin/admin-analytics-actions';

interface CohortHeatmapProps {
    data: CohortAnalytics;
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ data }) => {
    const [selectedCompetency, setSelectedCompetency] = useState<CohortAnalytics["competencies"][0] | null>(null);
    const [filterGravity, setFilterGravity] = useState(false);

    const filteredHeatMap = useMemo(() => {
        if (!filterGravity) return data.heatMap;
        return data.heatMap.filter(student =>
            Object.values(student.states).some(state => state === 'MISCONCEPTION')
        );
    }, [data.heatMap, filterGravity]);

    const getStateColor = (state: CompetencyEvaluationState | undefined) => {
        switch (state) {
            case 'MASTERED': return 'bg-emerald-500/80 hover:bg-emerald-400';
            case 'GAP': return 'bg-amber-500/80 hover:bg-amber-400';
            case 'MISCONCEPTION': return 'bg-rose-500/80 hover:bg-rose-400 animate-pulse-subtle';
            default: return 'bg-zinc-800 hover:bg-zinc-700';
        }
    };

    return (
        <div className="bg-[#252525] border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#2a2a2a]">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Matriz de Integridad Cognitiva</h3>
                    <div className="h-4 w-px bg-zinc-700" />
                    <button
                        onClick={() => setFilterGravity(!filterGravity)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-2 ${filterGravity ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                    >
                        <ShieldAlert size={14} />
                        Solo Críticos (Bugs)
                    </button>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastery</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Gap</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Misconception</div>
                </div>
            </div>

            {/* Matrix Container */}
            <div className="flex-1 overflow-auto relative custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="sticky top-0 z-20 bg-[#2a2a2a] shadow-md">
                            <th className="sticky left-0 z-30 bg-[#2a2a2a] p-4 text-left border-b border-zinc-800 min-w-[200px]">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Estudiante</span>
                            </th>
                            {data.competencies.map(comp => (
                                <th
                                    key={comp.id}
                                    onClick={() => setSelectedCompetency(comp)}
                                    className="p-4 border-b border-zinc-800 text-left min-w-[150px] cursor-pointer hover:bg-zinc-800 transition-colors group"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-zinc-300 group-hover:text-blue-400 transition-colors line-clamp-1">{comp.title}</span>
                                        <div className="flex gap-1">
                                            {comp.stats.bugCount > 0 && (
                                                <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1 rounded font-mono">
                                                    {comp.stats.bugCount}B
                                                </span>
                                            )}
                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1 rounded font-mono">
                                                {comp.stats.masteredCount}M
                                            </span>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHeatMap.map((student, idx) => (
                            <tr key={student.studentId} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="sticky left-0 z-10 bg-[#252525] p-4 border-b border-zinc-800 text-sm font-medium text-zinc-400">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                                            {idx + 1}
                                        </div>
                                        {student.studentName}
                                    </div>
                                </td>
                                {data.competencies.map(comp => {
                                    const state = student.states[comp.id];
                                    return (
                                        <td key={comp.id} className="p-1 border-b border-zinc-800">
                                            <div
                                                className={`h-10 rounded-md flex items-center justify-center transition-all cursor-crosshair ${getStateColor(state)}`}
                                                title={`${student.studentName} -> ${comp.title}: ${state || 'N/A'}`}
                                            >
                                                {state === 'MISCONCEPTION' && <ShieldAlert size={14} className="text-white/80" />}
                                                {state === 'MASTERED' && <div className="w-1.5 h-1.5 rounded-full bg-white/40" />}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Side Sheet for Refutation Strategy */}
            <AnimatePresence>
                {selectedCompetency && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCompetency(null)}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full w-[400px] bg-[#1e1e1e] border-l border-zinc-800 z-50 p-8 shadow-2xl flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <MessageSquareCode size={24} />
                                </div>
                                <button onClick={() => setSelectedCompetency(null)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">{selectedCompetency.title}</h2>
                            <p className="text-zinc-500 text-sm mb-8 uppercase tracking-widest font-bold">Protocolo de Intervención Grupal</p>

                            <div className="space-y-6 flex-1 overflow-auto pr-2">
                                <section>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
                                        <Info size={14} /> Diagnóstico de Cohorte
                                    </h4>
                                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-800">
                                        <p className="text-sm text-zinc-300 leading-relaxed italic">
                                            "{selectedCompetency.topMisconception || 'No se han detectado malentendidos sistémicos en este nodo.'}"
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-bold text-rose-400 uppercase mb-3 flex items-center gap-2">
                                        <ShieldAlert size={14} /> Estrategia de Refutación
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 font-bold text-xs border border-rose-500/20">1</div>
                                            <p className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4">Presentar contraejemplo visual del malentendido.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 font-bold text-xs border border-rose-500/20">2</div>
                                            <p className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4">Solicitar predicción basada en el modelo mental erróneo.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-xs border border-blue-500/20">3</div>
                                            <p className="text-sm text-zinc-400">Instalar el nuevo concepto mediante andamiaje (Scaffolding).</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2 border border-zinc-700 text-sm">
                                    Generar Guía Docente (PDF)
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
