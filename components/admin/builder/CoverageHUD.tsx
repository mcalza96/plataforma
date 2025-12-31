"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Circle, Clock } from "lucide-react";
import { Concept, Misconception } from "@/hooks/admin/builder/useExamBuilder";

interface CoverageHUDProps {
    concepts: Concept[];
    misconceptions: Misconception[];
    onConceptClick: (name: string) => void;
}

export function CoverageHUD({ concepts, misconceptions, onConceptClick }: CoverageHUDProps) {
    return (
        <div className="space-y-8">
            {/* Nuclear Concepts Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                        Matriz Q: Conceptos Nucleares
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {concepts.length} IDENTIFICADOS
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {concepts.length === 0 ? (
                            <p className="text-zinc-600 text-[11px] italic col-span-2 py-4 border border-dashed border-white/5 rounded-xl text-center">
                                Esperando detección de conceptos...
                            </p>
                        ) : (
                            concepts.map((concept) => (
                                <motion.div
                                    key={concept.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => concept.status === 'PENDING' && onConceptClick(concept.name)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${concept.status === 'COVERED'
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : concept.status === 'IN_PROGRESS'
                                                ? 'bg-amber-500/5 border-amber-500/20'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className={`text-xs font-bold ${concept.status === 'COVERED' ? 'text-emerald-400' : 'text-zinc-200'
                                                }`}>
                                                {concept.name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {concept.status === 'COVERED' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircle2 className="size-3 text-emerald-500" />
                                                        <span className="text-[9px] font-mono text-emerald-500/70 uppercase">Cubierto</span>
                                                    </div>
                                                ) : concept.status === 'IN_PROGRESS' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="size-3 text-amber-500 animate-pulse" />
                                                        <span className="text-[9px] font-mono text-amber-500/70 uppercase">En Proceso</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                                        <Circle className="size-3" />
                                                        <span className="text-[9px] font-mono uppercase">Pendiente</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Misconceptions Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                        Shadow Nodes: Errores Detectados
                    </h3>
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {misconceptions.length === 0 ? (
                            <p className="text-zinc-600 text-[11px] italic py-4 border border-dashed border-white/5 rounded-xl text-center">
                                Sin fallos cognitivos mapeados aún.
                            </p>
                        ) : (
                            misconceptions.map((error) => (
                                <motion.div
                                    key={error.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-[#0D0D0D] border border-white/10 rounded-xl flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`size-2 rounded-full ${error.hasTrap ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'}`} />
                                        <p className="text-[11px] text-zinc-300 font-medium leading-relaxed max-w-md">
                                            {error.description}
                                        </p>
                                    </div>

                                    {!error.hasTrap && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                            <AlertCircle className="size-3 text-rose-500" />
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                                                Falta diseñar reactivo
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Interactive Footer */}
            {concepts.some(c => c.status === 'PENDING') && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between"
                >
                    <p className="text-[10px] text-amber-500/80 font-medium italic">
                        Tip: Haz clic en un concepto "Pendiente" para enfocar al Agente ahí.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
