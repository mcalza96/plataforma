'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Zap, Target, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrontierNode {
    id: string;
    title: string;
    status: 'ready' | 'blocked' | 'target' | 'mastered';
}

interface LearningFrontierMiniMapProps {
    nodes: FrontierNode[];
    className?: string;
}

/**
 * LearningFrontierMiniMap - Visualizes the "Learning Frontier" intersection.
 * Highlights nodes that are about to be unlocked or are currently targeted.
 */
export function LearningFrontierMiniMap({ nodes, className }: LearningFrontierMiniMapProps) {
    return (
        <div className={cn("p-4 rounded-2xl bg-[#0F0F0F] border border-white/5 relative overflow-hidden group", className)}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Network size={120} className="text-emerald-500" />
            </div>

            <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-emerald-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Frontera de Aprendizaje</h4>
                    </div>
                    <span className="text-[8px] font-mono text-white/30 truncate max-w-[100px]">
                        COHORTE_BETA_V1
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {nodes.map((node, idx) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "p-3 rounded-xl border flex flex-col gap-2 transition-all relative overflow-hidden",
                                node.status === 'target'
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : node.status === 'ready'
                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                        : "bg-white/5 border-white/5 text-white/40"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-black uppercase truncate">{node.title}</span>
                                {node.status === 'target' ? (
                                    <Target size={10} className="animate-pulse" />
                                ) : node.status === 'blocked' ? (
                                    <Lock size={10} />
                                ) : null}
                            </div>

                            {/* Visual Progress/Health indicator */}
                            <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: node.status === 'mastered' ? '100%' : '30%' }}
                                    className={cn(
                                        "h-full rounded-full",
                                        node.status === 'target' ? 'bg-emerald-500' : 'bg-blue-500'
                                    )}
                                />
                            </div>

                            {node.status === 'target' && (
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                            )}
                        </motion.div>
                    ))}

                    {nodes.length === 0 && (
                        <div className="col-span-2 py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl">
                            <Network size={20} className="text-white/10" />
                            <p className="text-[9px] font-medium text-white/20">Selecciona una sonda para ver el impacto</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <div className="flex -space-x-1.5 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block size-4 rounded-full border-2 border-[#1A1A1A] bg-zinc-800" />
                        ))}
                    </div>
                    <span className="text-[8px] font-medium text-white/40 italic">
                        +12 alumnos se sitúan en esta frontera
                    </span>
                </div>
            </div>

            {/* Neon Glow Effects */}
            <div className="absolute -bottom-4 -left-4 size-16 bg-emerald-500/10 blur-xl rounded-full" />
        </div>
    );
}
