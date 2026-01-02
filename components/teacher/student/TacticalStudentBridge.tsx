"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CognitiveMirror } from '@/components/assessment/results/CognitiveMirror';
import { TrafficLightGraph } from '@/components/dashboard/insights/TrafficLightGraph';
import { SessionForensicView } from '@/components/teacher/forensic/SessionForensicView';
import { StudentLatestDiagnostic } from '@/lib/actions/teacher/student-diagnostic-actions';

interface TacticalStudentBridgeProps {
    diagnostic: StudentLatestDiagnostic;
    studentName: string;
}

/**
 * TacticalStudentBridge: Cognitive Digital Twin Orchestrator
 * 
 * Transforms the student detail view into a forensic audit interface.
 * This component acts as the bridge between raw evaluation data and pedagogical intervention.
 */
export default function TacticalStudentBridge({ diagnostic, studentName }: TacticalStudentBridgeProps) {
    const [isForensicOpen, setIsForensicOpen] = useState(false);

    const hasMutations = diagnostic.appliedMutations && diagnostic.appliedMutations.length > 0;

    return (
        <div className="min-h-screen bg-[#1A1A1A] p-8 space-y-8">
            {/* Forensic Modal */}
            {isForensicOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-6xl animate-in zoom-in-95 duration-200">
                        <SessionForensicView
                            attemptId={diagnostic.attemptId}
                            onClose={() => setIsForensicOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-2xl text-emerald-500">psychology</span>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Gemelo Digital Cognitivo
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400">
                        Perfil de <span className="text-white font-bold">{studentName}</span> •
                        Última evaluación: <span className="text-white font-mono text-xs">
                            {new Date(diagnostic.completedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </p>
                </div>

                {/* Forensic Audit Button */}
                <button
                    onClick={() => setIsForensicOpen(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-all text-emerald-400 font-bold text-sm min-h-[44px]"
                >
                    <span className="material-symbols-outlined text-xl">biotech</span>
                    Iniciar Auditoría Forense
                </button>
            </div>

            {/* Metacognitive Header - The Mirror */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">psychology_alt</span>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Estado Metacognitivo
                    </h2>
                </div>
                <CognitiveMirror calibration={diagnostic.diagnosticResult.calibration as any} />
            </motion.div>

            {/* Topological Competency Map - The Traffic Light */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <div className="mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">hub</span>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Mapa Topológico de Competencias
                    </h2>
                </div>
                <TrafficLightGraph diagnoses={diagnostic.diagnosticResult.competencyDiagnoses as any} />
            </motion.div>

            {/* Remediation Justification (if mutations were applied) */}
            {hasMutations && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-amber-500 text-xl">warning</span>
                            <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider">
                                Intervenciones Automáticas Aplicadas
                            </h3>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                            El motor de remediación detectó patrones críticos y aplicó las siguientes mutaciones al grafo de aprendizaje:
                        </p>
                        <div className="space-y-2">
                            {diagnostic.appliedMutations?.map((mutation: any, index: number) => (
                                <div key={index} className="p-3 bg-black/20 rounded-lg border border-amber-500/10">
                                    <p className="text-xs font-mono text-amber-300">
                                        {mutation.action || 'MUTATION'}: {mutation.nodeId || mutation.targetId || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {mutation.reason || 'Remediación automatizada aplicada'}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsForensicOpen(true)}
                            className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
                        >
                            Ver justificación completa en Auditoría Forense
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Clinical Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="p-6 bg-[#252525] border border-white/5 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Nivel de Maestría
                    </span>
                    <div className="text-3xl font-black text-white">
                        {Math.round(diagnostic.diagnosticResult.overallScore)}%
                    </div>
                </div>

                <div className="p-6 bg-[#252525] border border-white/5 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Nodos Dominados
                    </span>
                    <div className="text-3xl font-black text-emerald-500">
                        {diagnostic.diagnosticResult.competencyDiagnoses.filter(d => d.state === 'MASTERED').length}
                    </div>
                </div>

                <div className="p-6 bg-[#252525] border border-white/5 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Errores Conceptuales
                    </span>
                    <div className="text-3xl font-black text-rose-500">
                        {diagnostic.diagnosticResult.competencyDiagnoses.filter(d => d.state === 'MISCONCEPTION').length}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
