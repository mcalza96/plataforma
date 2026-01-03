'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CohortRadar } from '../analytics/CohortRadar';
import { ShadowBoard } from '../analytics/ShadowBoard';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';
import { ArchetypeSelector } from '../analytics/ArchetypeSelector';
import { Activity, Brain, UserCheck, ShieldAlert } from 'lucide-react';

interface CognitiveHealthSectionProps {
    analytics: TeacherAnalyticsResult | null;
}

/**
 * CognitiveHealthSection - Dashboard section for tactical classroom intelligence.
 */
export const CognitiveHealthSection: React.FC<CognitiveHealthSectionProps> = ({ analytics }) => {
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

    // Filter analytics based on archetype
    const filteredRadar = analytics?.cohortRadar.filter(m =>
        !selectedArchetype || m.studentArchetype === selectedArchetype
    ) || [];

    // Calculate archetype counts for selector
    const counts = (analytics?.cohortRadar || []).reduce((acc, current) => {
        acc[current.studentArchetype] = (acc[current.studentArchetype] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Activity className="text-magenta-500" size={18} />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Inteligencia Táctica de Aula</h2>
                    </div>
                </div>

                <ArchetypeSelector
                    selected={selectedArchetype}
                    onSelect={setSelectedArchetype}
                    counts={counts}
                />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Cohort Radar (Macro Perspective) */}
                <div className="col-span-12 lg:col-span-7">
                    <CohortRadar
                        members={analytics?.cohortRadar || []}
                        onArchetypeSelect={setSelectedArchetype}
                    />
                </div>

                {/* Shadow Board & Pathologies */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <ShadowBoard pathologies={analytics?.pathologyRanking || []} />

                    <div className="p-8 rounded-[2.5rem] bg-[#1A1A1A] border border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="text-magenta-500" size={18} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">Estado de Inmunidad Cognitiva</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                La tasa de interferencia algorítmica se mantiene dentro de los parámetros de neutralidad (4/5 Rule).
                            </p>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-magenta-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
