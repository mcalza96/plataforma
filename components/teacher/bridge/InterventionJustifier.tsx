'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldAlert, Zap, Box, Trash2, CheckCircle, Info } from 'lucide-react';
import { overrideIntervention } from '@/lib/actions/teacher/forensic-actions';

interface Mutation {
    action: string;
    nodeId: string;
    reason: string;
    diagnosedMisconceptionId?: string;
    timestamp: string;
    attemptId: string;
}

interface InterventionJustifierProps {
    mutations: Mutation[];
}

/**
 * InterventionJustifier - "Caja Blanca" de la IA.
 * Expone por qué se aplicaron cambios al grafo y permite el control humano (Override).
 */
export function InterventionJustifier({ mutations }: InterventionJustifierProps) {
    const [overriddenIds, setOverriddenIds] = useState<Set<string>>(new Set());

    const handleOverride = async (mutation: Mutation, index: number) => {
        const id = `${mutation.attemptId}-${index}`;
        const justification = prompt("Justificación para anular esta intervención:");

        if (justification) {
            const res = await overrideIntervention(mutation.attemptId, index, justification);
            if (res.success) {
                setOverriddenIds(prev => new Set(prev).add(id));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Box className="text-magenta-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Libro de Mutaciones IA</h3>
            </div>

            <div className="space-y-4">
                {mutations.map((mut, idx) => {
                    const isOverridden = overriddenIds.has(`${mut.attemptId}-${idx}`);

                    return (
                        <motion.div
                            key={`${mut.attemptId}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                                "p-5 rounded-3xl border-2 transition-all relative overflow-hidden",
                                isOverridden
                                    ? "bg-zinc-900/50 border-white/5 opacity-50"
                                    : "bg-[#1A1A1A] border-magenta-500/20 hover:border-magenta-500/40"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "size-10 rounded-xl flex items-center justify-center shrink-0",
                                        isOverridden ? "bg-white/5 text-zinc-600" : "bg-magenta-500/10 text-magenta-500"
                                    )}>
                                        {mut.action.includes('INSERT') ? <Zap size={20} /> : <ShieldAlert size={20} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter">
                                                {mut.action === 'INSERT_NODE' ? 'Inyección de Remediacón' : 'Aislamiento de Nodo'}
                                            </h4>
                                            {isOverridden && (
                                                <span className="text-[8px] font-black bg-white/10 text-zinc-400 px-2 py-0.5 rounded uppercase">Anulado por Humano</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                                            {mut.reason || "La IA detectó una debilidad estructural en el modelo mental del alumno."}
                                        </p>

                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/5">
                                                <Info size={10} className="text-zinc-600" />
                                                <span className="text-[8px] font-mono text-zinc-500 uppercase">{mut.nodeId.split('-')[0]}</span>
                                            </div>
                                            <span className="text-[8px] font-mono text-zinc-700">{new Date(mut.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {!isOverridden && (
                                    <button
                                        onClick={() => handleOverride(mut, idx)}
                                        className="size-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95 group"
                                        title="Anular Intervención"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Applied Strategy Tag */}
                            {!isOverridden && (
                                <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12 group-hover:opacity-20 transition-opacity">
                                    <CheckCircle size={40} className="text-magenta-500" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {mutations.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 bg-white/[0.02]">
                        <ShieldAlert className="text-zinc-800" size={32} />
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest text-center">
                            No hay mutaciones activas en este gemelo.<br />
                            <span className="text-emerald-500/50">Integridad Estructural Óptima</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
