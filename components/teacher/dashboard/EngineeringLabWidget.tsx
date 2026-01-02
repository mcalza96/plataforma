"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DraftExam {
    id: string;
    title: string;
    updated_at: string;
}

interface EngineeringLabWidgetProps {
    draftExams: DraftExam[];
}

/**
 * EngineeringLabWidget: Shows draft exams and lab status
 * Provides quick access to continue editing in-progress exams
 */
export default function EngineeringLabWidget({ draftExams }: EngineeringLabWidgetProps) {
    const hasDrafts = draftExams && draftExams.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#252525] border border-emerald-500/20 rounded-2xl p-6 mb-8"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-xl text-emerald-500">science</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Laboratorio de Ingeniería Pedagógica</h2>
                    <p className="text-xs text-gray-400">Tus instrumentos en desarrollo</p>
                </div>
            </div>

            {/* Content */}
            {hasDrafts ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-emerald-400">{draftExams.length} borrador{draftExams.length > 1 ? 'es' : ''} en progreso</span>
                    </div>
                    {draftExams.map((exam) => (
                        <Link
                            key={exam.id}
                            href={`/teacher/exam-builder`}
                            className="group block p-4 bg-[#1A1A1A] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{exam.title || 'Sin título'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Última edición: {new Date(exam.updated_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-emerald-500 ml-3 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-emerald-500">lightbulb</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">No tienes borradores en progreso</p>
                    <Link
                        href="/teacher/exam-builder"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Crear tu primer diagnóstico
                    </Link>
                </div>
            )}
        </motion.div>
    );
}
