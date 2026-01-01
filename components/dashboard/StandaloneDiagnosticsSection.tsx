'use client';

import React from 'react';
import Link from 'next/link';
import { StandaloneExamAssignment } from '@/lib/domain/dtos/learner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StandaloneDiagnosticsSectionProps {
    assignments: StandaloneExamAssignment[];
    mode: 'MISSION' | 'DASHBOARD' | 'EXPLORER';
}

/**
 * StandaloneDiagnosticsSection
 * Hero section displaying pending "Calibration Probes" (Standalone Exams).
 * Visually decoupled from the Mission Map.
 */
export function StandaloneDiagnosticsSection({ assignments, mode }: StandaloneDiagnosticsSectionProps) {
    if (assignments.length === 0) return null;

    return (
        <section className="col-span-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white tracking-tight text-2xl font-bold flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500 animate-pulse">radar</span>
                    {mode === 'MISSION' ? 'Desafíos Especiales' : 'Sondas de Calibración Pendientes'}
                </h2>
                <span className="text-xs font-mono text-amber-500/80 uppercase px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                    Prioridad Alta
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment, index) => (
                    <DiagnosticCard
                        key={assignment.assignmentId}
                        assignment={assignment}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
}

function DiagnosticCard({ assignment, index }: { assignment: StandaloneExamAssignment; index: number }) {
    const isPriority = assignment.originContext === 'manual_intervention';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link
                href={`/assessment/${assignment.examId}`}
                className="group block relative overflow-hidden rounded-xl bg-[#1A1A1A] border border-amber-500/30 hover:border-amber-500/80 hover:bg-[#252525] transition-all duration-300 shadow-lg shadow-amber-900/10"
            >
                {/* Status Indicator Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />

                <div className="p-5 pl-7 flex flex-col gap-3">
                    {/* Header: Subject & Audience */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
                                {assignment.subject}
                            </span>
                            <h3 className="text-white text-lg font-bold leading-tight group-hover:text-amber-400 transition-colors">
                                {assignment.examTitle}
                            </h3>
                        </div>
                        {isPriority && (
                            <span className="flex items-center justify-center size-8 rounded-full bg-amber-500/20 text-amber-500">
                                <span className="material-symbols-outlined text-lg">priority_high</span>
                            </span>
                        )}
                    </div>

                    {/* Metadata: Audience & Date */}
                    <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium mt-1">
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">group</span>
                            Target: {assignment.targetAudience}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                        <span>
                            {format(new Date(assignment.assignedAt), "d 'de' MMMM", { locale: es })}
                        </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-500 group-hover:text-white transition-colors">
                            ID: {assignment.examId.slice(0, 8)}...
                        </span>
                        <div className="flex items-center gap-2 text-amber-500 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                            Iniciar Protocolo
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
