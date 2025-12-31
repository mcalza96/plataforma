'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Activity, ArrowRight, ClipboardList, Lightbulb } from 'lucide-react';
import { CompetencyDiagnosis } from '../../../lib/domain/evaluation/types';

interface PrescriptionCardProps {
    diagnoses: CompetencyDiagnosis[];
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ diagnoses }) => {
    const criticalIssues = diagnoses.filter(d => d.state === 'MISCONCEPTION');
    const gaps = diagnoses.filter(d => d.state === 'GAP');

    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden">
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

            <div className="p-6 space-y-6">
                {/* Diagnóstico Section */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <Activity className="w-3 h-3" />
                        Diagnóstico Clínico
                    </h4>
                    <div className="space-y-3">
                        {criticalIssues.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-rose-500/5 border-l-4 border-rose-500 rounded-r-lg"
                            >
                                <p className="text-sm text-rose-200 font-medium">Tienes {criticalIssues.length} bloqueos conceptuales (Bugs)</p>
                                <p className="text-xs text-rose-400 mt-1">Estos errores impiden avanzar a temas más complejos.</p>
                            </motion.div>
                        )}
                        {gaps.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-3 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg"
                            >
                                <p className="text-sm text-amber-200 font-medium">{gaps.length} Temas nuevos o "Gaps"</p>
                                <p className="text-xs text-amber-400 mt-1">Conceptos que aún no se han estructurado en tu memoria.</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Plan de Tratamiento */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <ClipboardList className="w-3 h-3" />
                        Plan de Tratamiento (Acciones)
                    </h4>
                    <div className="space-y-2">
                        {criticalIssues.map((issue, idx) => (
                            <div key={issue.competencyId} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800/60 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                    <Lightbulb className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 font-medium truncate">Ver Refutación: {issue.competencyId}</p>
                                    <p className="text-[10px] text-slate-500">Video explicativo + Ejemplo interactivo</p>
                                </div>
                                <button className="p-2 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {gaps.map((gap, idx) => (
                            <div key={gap.competencyId} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl group hover:bg-slate-800/60 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 font-medium truncate">Lección Base: {gap.competencyId}</p>
                                    <p className="text-[10px] text-slate-500">Andamiaje de fundamentos desde cero</p>
                                </div>
                                <button className="p-2 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-950/50 text-center">
                <p className="text-[10px] text-slate-600 font-mono italic">
                    Validado por TeacherOS Diagnostic Engine v1.0
                </p>
            </div>
        </div>
    );
};
