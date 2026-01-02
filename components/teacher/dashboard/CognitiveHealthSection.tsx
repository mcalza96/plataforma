import React from 'react';
import { motion } from 'framer-motion';
import { CohortRadar } from '@/components/teacher/analytics/CohortRadar';
import { ShadowBoard } from '@/components/teacher/analytics/ShadowBoard';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';

interface CognitiveHealthSectionProps {
    analytics: TeacherAnalyticsResult | null;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const CognitiveHealthSection = ({ analytics }: CognitiveHealthSectionProps) => (
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
);
