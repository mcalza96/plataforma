'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TacticalRecommendationPanelProps {
    recommendations: string[];
    className?: string;
}

export const TacticalRecommendationPanel: React.FC<TacticalRecommendationPanelProps> = ({ recommendations, className }) => {
    return (
        <div className={cn("bg-[#252525] p-6 rounded-2xl border border-white/5", className)}>
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Panel de Recomendaciones Tácticas</h3>
            </div>

            <div className="space-y-4">
                {recommendations.length === 0 ? (
                    <p className="text-zinc-600 italic text-xs py-4 text-center">
                        La cohorte se encuentra en niveles óptimos de calibración. No se requieren intervenciones críticas inmediatas.
                    </p>
                ) : (
                    recommendations.map((rec, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-4 bg-[#1A1A1A]/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="mt-1 size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
                            <p className="text-xs text-zinc-300 leading-relaxed italic">
                                "{rec}"
                            </p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Tactical Action Footer */}
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-zinc-500">assignment_turned_in</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Protocolo Sugerido</span>
                </div>
                <button className="text-[10px] font-black text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md uppercase tracking-tighter transition-colors">
                    Marcar como Leído
                </button>
            </div>
        </div>
    );
};
