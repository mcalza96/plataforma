'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Activity, ArrowRight, ClipboardList, Lightbulb, ShieldAlert, Microscope, BookOpen } from 'lucide-react';
import { CompetencyDiagnosis } from '@/lib/domain/assessment';

interface PrescriptionCardProps {
    diagnoses: CompetencyDiagnosis[];
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ diagnoses }) => {
    // Priority Sorting: Misconceptions (Bugs) > Gaps > Mastery (Ignored in prescription usually)
    const criticalIssues = diagnoses.filter(d => d.state === 'MISCONCEPTION');
    const gaps = diagnoses.filter(d => d.state === 'GAP');

    // Observer Guide mocked for now - essentially what parents should watch for
    const observerGuide = criticalIssues.length > 0
        ? "El estudiante tiende a confundir terminología similar. Monitoree si relee la pregunta antes de responder."
        : "El estudiante muestra fatiga en secuencias largas. Sugiera pausas activas cada 20 minutos.";

    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
            {/* Header - Pharmacy/Clinical Style */}
            <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Pill className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 leading-none">Prescripción de Nivelación</h3>
                        <p className="text-[10px] text-indigo-400 uppercase tracking-widest mt-1">Ref: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Diagnóstico Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <Activity className="w-3 h-3" />
                        Diagnóstico Clínico
                    </h4>
                    <div className="space-y-3">
                        {criticalIssues.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-rose-500/5 border-l-4 border-rose-500 rounded-r-lg"
                            >
                                <p className="text-sm text-rose-200 font-medium">Intervención Requerida: {criticalIssues.length} Bugs Activos</p>
                                <p className="text-xs text-rose-400 mt-1">Errores conceptuales arraigados detectados. Prioridad Alta.</p>
                            </motion.div>
                        ) : gaps.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg"
                            >
                                <p className="text-sm text-amber-200 font-medium">Nivelación Sugerida: {gaps.length} Gaps</p>
                                <p className="text-xs text-amber-400 mt-1">Áreas no exploradas o con cimientos débiles.</p>
                            </motion.div>
                        ) : (
                            <div className="p-3 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-lg">
                                <p className="text-sm text-emerald-200 font-medium">Estado Óptimo</p>
                                <p className="text-xs text-emerald-400 mt-1">No se requieren intervenciones críticas.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan de Tratamiento */}
                {(criticalIssues.length > 0 || gaps.length > 0) && (
                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            <ClipboardList className="w-3 h-3" />
                            Plan de Tratamiento (Acciones)
                        </h4>
                        <div className="space-y-2">
                            {/* Critical Issues - Red */}
                            {criticalIssues.map((issue, idx) => (
                                <div key={issue.competencyId + idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800/60 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                                        <ShieldAlert className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 font-medium truncate">Refutación: {issue.competencyId}</p>
                                        <p className="text-[10px] text-slate-500 group-hover:text-rose-400 transition-colors">Desmontar misconceptions</p>
                                    </div>
                                    <button className="p-2 text-slate-500 group-hover:text-rose-400 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Gaps - Amber */}
                            {gaps.map((gap, idx) => (
                                <div key={gap.competencyId + idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800/60 transition-colors border border-transparent hover:border-amber-500/20 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 font-medium truncate">Fundamentos: {gap.competencyId}</p>
                                        <p className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors">Construir base teórica</p>
                                    </div>
                                    <button className="p-2 text-slate-500 group-hover:text-amber-400 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Observer Guide */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <Microscope className="w-3 h-3" />
                        Guía del Observador
                    </h4>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <p className="text-xs text-slate-400 italic leading-relaxed">
                            "{observerGuide}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-900/20">
                    Iniciar Protocolo Completo
                </button>
            </div>
        </div>
    );
};
