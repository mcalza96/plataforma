"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Circle, Clock } from "lucide-react";
import { Concept, Misconception } from "@/hooks/admin/builder/useExamBuilder";

interface CoverageHUDProps {
    stage: string;
    readiness: number;
    concepts: Concept[];
    misconceptions: Misconception[];
    onConceptClick: (name: string) => void;
}

const STAGES = {
    initial_profiling: { label: 'Perfilado', icon: <Circle className="size-3" /> },
    concept_extraction: { label: 'Topología', icon: <Clock className="size-3" /> },
    shadow_work: { label: 'Sombra', icon: <AlertCircle className="size-3" /> },
    synthesis: { label: 'Síntesis', icon: <CheckCircle2 className="size-3" /> },
};

export function CoverageHUD({ stage, readiness, concepts, misconceptions, onConceptClick }: CoverageHUDProps) {
    const currentStage = STAGES[stage as keyof typeof STAGES] || STAGES.initial_profiling;

    return (
        <div className="space-y-10">
            {/* Stage & Readiness Header */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-amber-500">{currentStage.icon}</div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Fase: {currentStage.label}</h4>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Preparación del Blueprint</p>
                        <p className="text-xl font-black text-white">{readiness}%</p>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${readiness}%` }}
                        className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    />
                </div>
                <div className="flex justify-between">
                    {Object.entries(STAGES).map(([key, value]) => (
                        <div key={key} className={`flex flex-col items-center gap-1 opacity-${stage === key ? '100' : '30'}`}>
                            <div className={`size-1.5 rounded-full ${stage === key ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                            <span className="text-[8px] font-mono text-zinc-500 uppercase">{value.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nuclear Concepts Section */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                        Matriz Q: Conceptos Nucleares
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {concepts.length} NODOS
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {concepts.length === 0 ? (
                            <p className="text-zinc-600 text-[11px] italic col-span-2 py-8 border border-dashed border-white/5 rounded-2xl text-center font-mono uppercase tracking-widest">
                                Escaneando Topología...
                            </p>
                        ) : (
                            concepts.map((concept) => (
                                <motion.div
                                    key={concept.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => onConceptClick(concept.name)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${concept.status === 'COVERED'
                                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]'
                                        : concept.status === 'IN_PROGRESS'
                                            ? 'bg-amber-500/5 border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]'
                                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-tighter">ID-CON-{concept.id.slice(0, 4)}</p>
                                            <p className="text-[13px] font-bold text-white tracking-tight">
                                                {concept.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {concept.status === 'COVERED' ? (
                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                            ) : concept.status === 'IN_PROGRESS' ? (
                                                <div className="size-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
                                            ) : (
                                                <Circle className="size-4 text-zinc-700" />
                                            )}
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
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-rose-500/80 uppercase tracking-[0.2em]">
                        Shadow Nodes: Ingeniería de Distractores
                    </h3>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {misconceptions.length === 0 ? (
                            <p className="text-zinc-600 text-[11px] italic py-8 border border-dashed border-white/5 rounded-2xl text-center font-mono uppercase tracking-widest">
                                Buscando Puntos de Falla...
                            </p>
                        ) : (
                            misconceptions.map((error) => (
                                <motion.div
                                    key={error.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-5 bg-[#121212] border border-white/5 rounded-2xl flex items-start justify-between group"
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1 size-3 rounded-full shrink-0 ${error.hasTrap ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'}`} />
                                        <div className="space-y-2">
                                            <p className="text-[12px] text-zinc-100 font-medium leading-relaxed">
                                                {error.description}
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-mono text-zinc-600 uppercase">Lógica</p>
                                                    <p className="text-[10px] text-zinc-400">Sombra Detectada</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-mono text-zinc-600 uppercase">Validación</p>
                                                    <p className={`text-[10px] ${error.hasTrap ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {error.hasTrap ? 'Trampa Calibrada' : 'Falta Reactivo'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
