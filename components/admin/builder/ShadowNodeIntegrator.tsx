'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Box, Plus, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ShadowNode {
    id?: string;
    error: string;
    refutation: string;
    distractor_artifact?: string;
}

interface ShadowNodeIntegratorProps {
    shadowNodes: ShadowNode[];
    onIntegrate?: (node: ShadowNode) => void;
    className?: string;
}

/**
 * ShadowNodeIntegrator - Widget to visualize and integrate detected misconceptions
 * into the calibration probe design.
 */
export function ShadowNodeIntegrator({
    shadowNodes,
    onIntegrate,
    className
}: ShadowNodeIntegratorProps) {
    return (
        <div className={cn("flex flex-col gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Ghost size={16} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Nodos Sombra Detectados</h3>
                        <p className="text-[9px] font-medium text-white/40">Misconceptions identificadas por la IA</p>
                    </div>
                </div>
                <Badge variant="outline" className="bg-red-500/5 text-red-500/80 border-red-500/20 text-[9px] font-bold">
                    {shadowNodes.length} Nodos
                </Badge>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {shadowNodes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-white/10 rounded-xl"
                        >
                            <AlertCircle size={20} className="text-white/20" />
                            <p className="text-[10px] font-medium text-white/30 px-4">
                                No hay nodos sombra detectados aún. Continúa la entrevista para identificar brechas cognitivas.
                            </p>
                        </motion.div>
                    ) : (
                        shadowNodes.map((node, idx) => (
                            <motion.div
                                key={node.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-red-500/30 transition-all cursor-grab active:cursor-grabbing"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-black text-white group-hover:text-red-400 transition-colors">
                                            {node.error}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onIntegrate?.(node)}
                                            className="size-6 rounded-lg opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 transition-all"
                                        >
                                            <Plus size={12} className="text-red-400" />
                                        </Button>
                                    </div>
                                    <p className="text-[9px] text-white/40 line-clamp-2 leading-relaxed">
                                        {node.refutation}
                                    </p>
                                </div>

                                {node.distractor_artifact && (
                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                                        <div className="size-4 rounded bg-white/5 flex items-center justify-center">
                                            <Box size={8} className="text-white/40" />
                                        </div>
                                        <span className="text-[8px] font-mono text-white/30 truncate">
                                            {node.distractor_artifact}
                                        </span>
                                    </div>
                                )}

                                <div className="absolute -left-px top-1/2 -translate-y-1/2 w-0.5 h-6 bg-red-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[8px] font-medium text-amber-500/60 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                    <Info size={10} />
                    <span>Arrastra un nodo a una opción para vincular el distractor.</span>
                </div>
            </div>

            <style jsx global>{`
                .avatar-glow {
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                }
            `}</style>
        </div>
    );
}
