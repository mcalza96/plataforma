'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Lightbulb, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ArchitectState } from '@/lib/domain/architect';

interface CoverageHUDProps {
    state: ArchitectState;
    onSuggestionClick?: (type: 'concept' | 'misconception', value: string) => void;
}

export function CoverageHUD({ state, onSuggestionClick }: CoverageHUDProps) {
    const { readiness, context } = state;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 min-w-[280px]"
        >
            {/* Readiness Summary Card */}
            <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Métrica de Madurez</span>
                    {readiness.isValid && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 size={12} />
                            LISTO
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(readiness.conceptCount, 3) / 3) * 60}%` }}
                        className="h-full bg-blue-500"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(readiness.misconceptionCount, 1) / 1) * 40}%` }}
                        className="h-full bg-amber-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                            <Lightbulb size={10} />
                            Conceptos
                        </div>
                        <div className="text-xl font-black text-white">{readiness.conceptCount}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <ShieldAlert size={10} />
                            Sombra
                        </div>
                        <div className="text-xl font-black text-white">{readiness.misconceptionCount}</div>
                    </div>
                </div>
            </div>

            {/* Expanded List - Only visible when interacting perhaps, but for now let's show simple alerts if missing */}
            <AnimatePresence>
                {!readiness.isValid && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-amber-500/20 transition-colors"
                        onClick={() => onSuggestionClick?.('misconception', "Necesitamos detectar al menos un malentendido común.")}
                    >
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Sparkles className="size-4 text-amber-500" />
                        </div>
                        <div className="text-[11px] font-medium text-amber-200">
                            Falta detectar un malentendido crítico
                        </div>
                        <ChevronRight size={14} className="ml-auto text-amber-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
