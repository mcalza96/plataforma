'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { CohortRadar } from '@/components/teacher/analytics/CohortRadar';
import { ShadowBoard } from '@/components/teacher/analytics/ShadowBoard';
import { TeacherAnalyticsResult } from '@/lib/actions/teacher/teacher-analytics-actions';
import { SessionForensicView } from './forensic/SessionForensicView';
import { getLatestCompletedAttempt } from '@/lib/actions/teacher/forensic-actions';
import { MetacognitiveMirror } from './analytics/metacognition/MetacognitiveMirror';

interface TeacherDashboardViewProps {
    student: {
        id: string;
        display_name: string;
        level: number;
        avatar_url?: string;
    };
    stats: {
        totalProjects: number;
    };
    analytics: TeacherAnalyticsResult | null;
}

/**
 * TeacherDashboardView: Presentation layer for the institutional control center.
 * Focus: Cognitive Intelligence and Tactical Decision Making.
 */
export default function TeacherDashboardView({
    student,
    stats,
    analytics
}: TeacherDashboardViewProps) {
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [isForensicOpen, setIsForensicOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleOpenForensic = async () => {
        setIsSearching(true);
        const attemptId = await getLatestCompletedAttempt(student.id);
        if (attemptId) {
            setSelectedAttemptId(attemptId);
            setIsForensicOpen(true);
        } else {
            alert("No se encontraron sesiones completadas para este alumno.");
        }
        setIsSearching(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-7xl mx-auto w-full px-6 py-12"
        >
            {/* Modal de Auditoría Forense */}
            {isForensicOpen && selectedAttemptId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-6xl animate-in zoom-in-95 duration-200">
                        <SessionForensicView
                            attemptId={selectedAttemptId}
                            onClose={() => setIsForensicOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Header / Hero */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-8">
                    <div className="relative w-28 h-28 p-1 rounded-[2.5rem] bg-gradient-to-br from-primary to-neon-violet shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                        <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-neutral-900 border-2 border-black/20">
                            <OptimizedImage
                                src={student.avatar_url || ''}
                                alt={student.display_name}
                                fill
                                className="object-cover"
                                fallbackIcon="person"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Centro de Inteligencia</span>
                            <div className="h-px w-8 bg-rose-500/20" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Gestión Táctica</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
                            {student.display_name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                                <span className="material-symbols-outlined text-sm text-rose-500">monitoring</span>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Enlace Neuronal Activo</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado del Sistema</span>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs font-bold text-white uppercase tracking-tighter">Motor de Inferencia Operativo</span>
                    </div>
                </div>
            </motion.div>

            {/* Hero Area: Inteligencia Táctica de Aula */}
            <motion.div variants={itemVariants} className="mb-16">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="material-symbols-outlined text-rose-500">biotech</span>
                        Estado de Salud Cognitiva
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-rose-500/50 bg-rose-500/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-rose-500/10">Algoritmo Diagnóstico v2</span>
                    </div>
                </div>

                {analytics ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <CohortRadar members={analytics.cohortRadar} />
                        <ShadowBoard pathologies={analytics.pathologyRanking} />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-white/5 p-16 rounded-[3rem] text-center bg-white/[0.01]">
                        <span className="material-symbols-outlined text-5xl text-gray-800 mb-4">analytics</span>
                        <p className="text-gray-400 italic font-bold max-w-xs mx-auto text-sm mb-4">
                            No hay datos de analítica forense todavía.
                        </p>
                        <p className="text-gray-600 text-xs italic">
                            Asigna tu primer diagnóstico para activar la capa de inteligencia cognitiva.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Metacognitive Intelligence Suite */}
            <motion.div variants={itemVariants} className="mb-24">
                <MetacognitiveMirror />
            </motion.div>

            {/* Auditoría Forense por Alumno */}
            <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="material-symbols-outlined text-neon-violet">museum</span>
                        Evidencias de Desempeño y Auditoría
                    </h3>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Modelos Mentales Detectados</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {stats.totalProjects > 0 ? (
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="group relative bg-[#1F1F1F] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden"
                        >
                            <div className="aspect-video bg-neutral-900 overflow-hidden relative rounded-[2.2rem]">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={handleOpenForensic}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSearching ? 'Buscando...' : 'Revisar Auditoría Cognitiva Completa'}
                                        <span className="material-symbols-outlined text-sm">open_in_full</span>
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="px-4 py-1.5 bg-black/6 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">Snapshot de Calibración</span>
                                </div>
                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                    <span className="material-symbols-outlined text-6xl">query_stats</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Reporte Forense del Alumno</h4>
                                <p className="text-xs text-gray-500 mb-0 italic">Auditoría técnica de modelos mentales, sesgos cognitivos y brechas de aprendizaje identificadas.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="col-span-full border-2 border-dashed border-white/5 p-16 rounded-[3rem] text-center bg-white/[0.01]">
                            <p className="text-gray-600 italic font-medium uppercase text-[10px] tracking-[0.2em]">No hay evidencias registradas en este cohorte.</p>
                        </div>
                    )}

                    {/* Quick Insight Placeholder for another forensic tool */}
                    <div className="bg-surface-darker/30 rounded-[2.5rem] border border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center opacity-50">
                        <span className="material-symbols-outlined text-4xl text-gray-700 mb-4">psychology_alt</span>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Detección de Sesgos Algorítmicos</p>
                        <p className="text-[9px] text-gray-700 italic mt-2 italic">Análisis de consistencia interna en progreso...</p>
                    </div>
                </div>
            </motion.div>
        </motion.main>
    );
}
