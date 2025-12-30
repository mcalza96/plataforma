'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';

interface LiveContextViewProps {
    session: CopilotSessionHelper;
}

/**
 * LiveContextView: A HUD-style visualization of the AI's "Mind".
 * Shows metadata, concepts and detected misconceptions.
 */
export function LiveContextView({ session }: LiveContextViewProps) {
    const { liveContext: context } = session;

    return (
        <div className="h-full flex flex-col p-8 space-y-10 overflow-y-auto custom-scrollbar">
            {/* Header HUD */}
            <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-amber-500">Live Context</h3>
                <p className="text-[10px] text-white/20 font-medium italic">Lo que el Copilot ha procesado hasta ahora.</p>
            </div>

            {/* Metadatos Compactos */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Materia</span>
                    <p className="text-[11px] font-bold text-white truncate">
                        {context.subject || 'Analizando...'}
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Audiencia</span>
                    <p className="text-[11px] font-bold text-white truncate">
                        {context.targetAudience || 'Detectando...'}
                    </p>
                </div>
            </div>

            {/* Conceptos Clave */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Conceptos Core</h4>
                    <span className="text-xs text-blue-400/50 font-black italic">#{context.keyConcepts?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {context.keyConcepts?.map((concept, idx) => (
                            <motion.div
                                key={concept}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition-all cursor-default">
                                    {concept}
                                </Badge>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {!context.keyConcepts?.length && (
                        <p className="text-[10px] text-white/10 italic">Escuchando conceptos clave...</p>
                    )}
                </div>
            </div>

            {/* Errores y Refutaciones */}
            <div className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/50">Gap de Aprendizaje</h4>
                <div className="space-y-3">
                    <AnimatePresence>
                        {context.identifiedMisconceptions?.map((m, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-5 rounded-2xl bg-red-500/[0.02] border border-red-500/10 space-y-3 group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500/50 text-lg mt-0.5">warning</span>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-red-500/80 uppercase tracking-tight">Potencial Error</p>
                                        <p className="text-[11px] text-white/70 leading-relaxed">{m.error}</p>
                                    </div>
                                </div>
                                <div className="pl-8 pt-2 border-t border-white/[0.02] space-y-1">
                                    <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-tight">Refutación Sugerida</p>
                                    <p className="text-[10px] text-white/40 italic leading-relaxed">"{m.refutation}"</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {!context.identifiedMisconceptions?.length && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-10">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                            <p className="text-[9px] font-black uppercase mt-2">Sin fricción detectada</p>
                        </div>
                    )}
                </div>
            </div>

            {/* HUD Footer Decorator */}
            <div className="pt-10 flex flex-col items-center gap-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="size-1.5 rounded-full bg-amber-500"
                    />
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em]">Deep Insights Active</span>
                </div>
            </div>
        </div>
    );
}
