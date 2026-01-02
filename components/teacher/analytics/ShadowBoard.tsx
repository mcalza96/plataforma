'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Pathology } from '@/lib/actions/teacher/teacher-analytics-actions';

interface ShadowBoardProps {
    pathologies: Pathology[];
    className?: string;
}

/**
 * Pizarra de Sombras: Visualiza el ranking de patologías cognitivas (Top 3)
 */
export const ShadowBoard: React.FC<ShadowBoardProps> = ({ pathologies, className }) => {
    // Limit to top 3 for tactical focus
    const top3Pathologies = pathologies.slice(0, 3);
    const maxOccurrences = Math.max(...top3Pathologies.map(p => p.totalOccurrences), 1);

    return (
        <div className={cn("bg-[#1A1A1A] p-6 rounded-xl border border-white/5", className)}>
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-rose-500">psychology_alt</span>
                <h2 className="text-xl font-semibold text-white tracking-tight">Nodos Sombra (Top 3)</h2>
            </div>

            <div className="space-y-3">
                {top3Pathologies.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 opacity-60">
                            check_circle
                        </span>
                        <p className="text-emerald-400 font-bold text-sm mb-1">
                            No se detectaron misconceptions críticos
                        </p>
                        <p className="text-emerald-500/60 text-xs italic">
                            La cohorte está operando sin errores conceptuales arraigados.
                        </p>
                    </div>
                ) : (
                    top3Pathologies.map((pathology, index) => (
                        <PathologyCard
                            key={`${pathology.competencyId}-${index}`}
                            pathology={pathology}
                            index={index}
                            intensity={pathology.totalOccurrences / maxOccurrences}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

interface PathologyCardProps {
    pathology: Pathology;
    index: number;
    intensity: number;
}

const PathologyCard: React.FC<PathologyCardProps> = ({ pathology, index, intensity }) => {
    const isRooted = pathology.avgConfidenceScore > 80;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            className="group relative flex items-center gap-4 bg-[#252525] p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors min-h-[44px]"
        >
            {/* Indicador de intensidad vertical */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-rose-500"
                style={{ opacity: 0.3 + (intensity * 0.7) }}
            />

            <div className="flex-1 flex flex-col gap-1 pl-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-300 font-medium text-sm tracking-wide uppercase">
                        {pathology.competencyId}
                    </span>
                    <div className="flex items-center gap-2">
                        {isRooted && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-tighter rounded border border-rose-500/30">
                                ARRAIGADO
                            </span>
                        )}
                        <span className="text-zinc-500 text-xs font-mono">
                            ×{pathology.totalOccurrences}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-white text-base font-semibold">
                        {pathology.state}
                    </span>
                    <p className="text-zinc-400 italic text-sm mt-1 leading-relaxed">
                        "{pathology.reason}"
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Confianza</div>
                <div className="text-sm font-mono text-white">{Math.round(pathology.avgConfidenceScore)}%</div>
            </div>
        </motion.div>
    );
};
