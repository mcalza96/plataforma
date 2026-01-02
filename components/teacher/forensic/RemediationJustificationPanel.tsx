'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getRemediationHistory, RemediationHistory, RemediationEvent } from '@/lib/actions/teacher/remediation-actions';

interface RemediationJustificationPanelProps {
    attemptId: string;
}

export const RemediationJustificationPanel: React.FC<RemediationJustificationPanelProps> = ({ attemptId }) => {
    const [history, setHistory] = useState<RemediationHistory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getRemediationHistory(attemptId);
            setHistory(data);
            setLoading(false);
        }
        load();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <div className="size-8 border-4 border-white/5 border-t-amber-500 animate-spin rounded-full" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Accediendo al Ledger Forense...</span>
            </div>
        );
    }

    if (!history || history.events.length === 0) {
        return (
            <div className="p-12 text-center bg-[#1A1A1A] rounded-2xl border border-dashed border-white/5">
                <span className="material-symbols-outlined text-4xl text-zinc-800 mb-4">history_edu</span>
                <p className="text-zinc-500 italic text-sm">No se han registrado mutaciones de remediación para esta sesión.</p>
                <p className="text-zinc-700 text-[10px] uppercase font-bold mt-2 tracking-widest">El sistema no detectó patologías que requirieran cambios en el grafo.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
            {/* Header: Sala de Control */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-amber-500 text-lg">terminal</span>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Veredicto de Remediación</h2>
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Justificación de Mutaciones Curriculares Automáticas</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Versión Algoritmo</span>
                    <span className="text-xs font-mono text-white">{history.algorithmVersion}</span>
                </div>
            </div>

            {/* Timeline of Decisions */}
            <div className="relative space-y-8 pl-4">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10" />

                {history.events.map((event, idx) => (
                    <RemediationEventCard key={event.id} event={event} index={idx} />
                ))}
            </div>

            {/* Footer: Auditoría */}
            <div className="mt-4 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-rose-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Cuarentena</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-amber-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Refuerzo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Liberación</span>
                    </div>
                </div>
                <p className="text-[9px] text-zinc-600 italic">
                    * El profesor tiene potestad de sobreescribir cualquier veredicto en la visualización del grafo.
                </p>
            </div>
        </div>
    );
};

const RemediationEventCard: React.FC<{ event: RemediationEvent; index: number }> = ({ event, index }) => {
    const isCritical = event.status === 'infected' || event.action === 'LOCK_DOWNSTREAM';
    const isMastery = event.status === 'mastered' || event.action === 'UNLOCK_NEXT';

    // Quality Colors
    const qualityColors = {
        SOLID: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        CONFUSION: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        NOISE: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8"
        >
            {/* Timeline Handle */}
            <div className={cn(
                "absolute left-[-4px] top-6 size-2.5 rounded-full z-10 border-2 border-[#1A1A1A]",
                isCritical ? "bg-rose-500" : isMastery ? "bg-emerald-500" : "bg-amber-500"
            )} />

            {/* Content Board */}
            <div className={cn(
                "bg-[#252525] rounded-xl border p-5 transition-all hover:bg-[#282828]",
                isCritical ? "border-rose-500/30" : isMastery ? "border-emerald-500/30" : "border-amber-500/30",
                event.evidence?.quality === 'CONFUSION' ? "shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)]" : ""
            )}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center",
                            isCritical ? "bg-rose-500/10 text-rose-500" : isMastery ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                            <span className="material-symbols-outlined text-sm">
                                {event.action === 'LOCK_DOWNSTREAM' ? 'lock' :
                                    event.status === 'infected' ? 'coronavirus' :
                                        isMastery ? 'verified' : 'healing'}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">{event.actionLabel}</h4>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">{event.targetId}</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Causal Thread (Evidence) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Evidencia Causal</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <div className="flex flex-col gap-2">
                            {event.evidence ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded uppercase border",
                                            qualityColors[event.evidence.quality as keyof typeof qualityColors]
                                        )}>
                                            {event.evidence.quality}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{event.evidence.type}</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                                        "{event.evidence.description}"
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-zinc-500 italic">Evidencia agregada por desempeño histórico.</p>
                            )}
                        </div>
                    </div>

                    {/* Sentence (Mutation Action) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Sentencia (Acción IA)</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">{event.action}</span>
                                <span className="material-symbols-outlined text-xs text-zinc-600">arrow_forward</span>
                                <span className={cn(
                                    "text-[10px] font-black uppercase",
                                    isCritical ? "text-rose-500" : isMastery ? "text-emerald-500" : "text-amber-500"
                                )}>
                                    {event.status}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                {event.reason}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Validation Controls */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] text-zinc-600">
                        <span className="material-symbols-outlined text-[10px]">info</span>
                        Auditoría requerida en caso de duda manual
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">edit</span>
                            Corregir
                        </button>
                        <button className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-500/20 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Validar
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
