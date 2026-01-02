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
 * Pizarra de Sombras: Visualiza el ranking de patologías cognitivas
 */
export const ShadowBoard: React.FC<ShadowBoardProps> = ({ pathologies, className }) => {
    // Calcular el máximo de ocurrencias para normalizar la opacidad
    const maxOccurrences = Math.max(...pathologies.map(p => p.totalOccurrences), 1);

    return (
        <div className={cn("bg-[#1A1A1A] p-6 rounded-xl border border-white/5", className)}>
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-rose-500">psychology_alt</span>
                <h2 className="text-xl font-semibold text-white tracking-tight">Pizarra de Sombras</h2>
            </div>

            <div className="space-y-3">
                {pathologies.length === 0 ? (
                    <p className="text-zinc-500 italic text-center py-8">No se han detectado patologías críticas.</p>
                ) : (
                    pathologies.map((pathology, index) => (
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
