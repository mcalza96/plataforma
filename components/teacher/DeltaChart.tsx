'use client';

import { motion } from 'framer-motion';

export interface DeltaItem {
    category: string;
    initial: number;
    current: number;
}

interface DeltaChartProps {
    data: DeltaItem[];
}

/**
 * DeltaChart: Visualizes the incremental growth in student competencies.
 */
export default function DeltaChart({ data }: DeltaChartProps) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover/card:bg-amber-500/10 transition-all duration-700" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500">trending_up</span>
                        Evolución de Competencias
                    </h3>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Crecimiento Delta</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {data.map((delta, index) => {
                        const growth = delta.current - delta.initial;
                        return (
                            <motion.div
                                key={delta.category}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="group/item"
                            >
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 ml-1">
                                    <span className="group-hover/item:text-white transition-colors">{delta.category}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-700 font-bold">BASE: {delta.initial}%</span>
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: index * 0.15 + 0.5 }}
                                            className="text-amber-500 font-black"
                                        >
                                            +{growth}% IMPACTO ACADÉMICO
                                        </motion.span>
                                    </div>
                                </div>

                                <div className="h-8 w-full bg-black/40 rounded-2xl flex overflow-hidden p-1.5 border border-white/5 group-hover/item:border-amber-500/30 transition-all shadow-inner">
                                    {/* Initial Level Bar */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${delta.initial}%` }}
                                        transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-gray-800 rounded-xl relative"
                                    >
                                        <div className="absolute inset-0 bg-white/[0.03]"></div>
                                    </motion.div>

                                    {/* Growth Delta Bar */}
                                    {growth > 0 && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${growth}%` }}
                                            transition={{ delay: 0.8 + (index * 0.1), duration: 1.2, ease: 'backOut' }}
                                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-xl relative ml-1 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                <p className="text-[10px] text-gray-600 font-bold italic text-center uppercase tracking-widest">
                    * El "Delta" cuantifica el salto incremental en maestría técnica
                </p>
            </div>
        </div>
    );
}
