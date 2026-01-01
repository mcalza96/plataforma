'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CohortHeatmapProps {
    items: {
        id: string;
        slip: number;
        discrimination: number;
        status: 'OK' | 'CRITICAL' | 'WARNING';
    }[];
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ items }) => {
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
                Índice de Fricción Cognitiva (Friction Index)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                            relative p-4 rounded-lg border flex flex-col gap-2
                            ${item.status === 'CRITICAL' ? 'bg-rose-950/30 border-rose-500/50' : 'bg-black/40 border-white/5'}
                        `}
                    >
                        {item.status === 'CRITICAL' && (
                            <div className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </div>
                        )}

                        <div className="text-xs text-zinc-500 font-mono">{item.id.slice(0, 8)}...</div>

                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-[10px] uppercase text-zinc-500">Slip (Ambigüedad)</div>
                                <div className={`text-xl font-bold ${item.status === 'CRITICAL' ? 'text-rose-400' : 'text-white'}`}>
                                    {(item.slip * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-zinc-500">Discriminación</div>
                                <div className="text-sm font-mono text-cyan-400">
                                    {item.discrimination.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Friction Bar */}
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                                className={`h-full ${item.status === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(item.slip * 100, 100)}%` }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
