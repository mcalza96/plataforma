'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CopilotSessionHelper } from '@/hooks/admin/phase-editor/useCopilotSession';
import { Lightbulb, AlertTriangle, Target, Map as MapIcon, ChevronRight } from 'lucide-react';

interface LiveContextViewProps {
    session: CopilotSessionHelper;
}

/**
 * LiveContextView: A premium HUD-style visualization of the AI's "Mind".
 * Shows metadata, concepts and detected misconceptions as a "Glass Box".
 */
export function LiveContextView({ session }: LiveContextViewProps) {
    const { liveContext: context } = session;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="h-full flex flex-col bg-[#121212] overflow-hidden">
            {/* Header HUD */}
            <div className="p-8 pb-4 space-y-2 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Pedagogical Observer</h3>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    Topología del Conocimiento
                    <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-amber-500/30 text-amber-500 bg-amber-500/5">
                        Live Extract
                    </Badge>
                </h2>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar"
            >
                {/* 1. Identificación del Sujeto/Audiencia */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <div className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-300 space-y-3">
                        <div className="flex items-center gap-2 text-blue-400/60">
                            <Target className="size-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Materia Detectada</span>
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {context.subject || 'Analizando dominio...'}
                        </p>
                    </div>
                    <div className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all duration-300 space-y-3">
                        <div className="flex items-center gap-2 text-purple-400/60">
                            <MapIcon className="size-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Público Objetivo</span>
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                            {context.targetAudience || 'Detectando perfil...'}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Mapa de Conceptos Core */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="size-3.5 text-blue-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Nodos de Conocimiento</h4>
                        </div>
                        <span className="text-[10px] text-blue-400/50 font-black tabular-nums">{context.keyConcepts?.length || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <AnimatePresence mode="popLayout">
                            {context.keyConcepts?.map((concept) => (
                                <motion.div
                                    key={concept}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ y: -2 }}
                                >
                                    <Badge className="bg-blue-500/5 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-[11px] font-semibold hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-default shadow-lg shadow-blue-500/5">
                                        {concept}
                                    </Badge>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {!context.keyConcepts?.length && (
                            <div className="w-full py-8 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                                <p className="text-[10px] text-white/20 italic font-medium uppercase tracking-widest">Extrayendo topología...</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 3. Alertas de Fricción (Gaps & Misconceptions) */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70">Puntos de Fricción</h4>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {context.identifiedMisconceptions?.map((m, idx) => (
                                <motion.div
                                    key={`misconception-${idx}`}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="relative overflow-hidden p-6 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 space-y-4 group hover:bg-amber-500/[0.05] hover:border-amber-500/20 transition-all duration-300"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <AlertTriangle className="size-12 text-amber-500" />
                                    </div>

                                    <div className="relative space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-amber-500/50 text-amber-500 bg-amber-500/10">Constructive Warning</Badge>
                                        </div>
                                        <p className="text-sm font-bold text-white/90 pr-10 leading-relaxed">
                                            {m.error}
                                        </p>
                                    </div>

                                    <div className="relative p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <ChevronRight className="size-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Estrategia de Refutación</span>
                                            </div>
                                            <span className="text-[8px] text-white/30 uppercase font-black">Counter-Measure Active</span>
                                        </div>
                                        <p className="text-[11px] text-white/60 italic leading-relaxed font-medium">
                                            "{m.refutation}"
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {!context.identifiedMisconceptions?.length && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.1 }}
                                className="flex flex-col items-center justify-center py-16 border border-dashed border-white/5 rounded-3xl"
                            >
                                <Target className="size-8 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin fricción detectada</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* HUD Footer Decorator */}
            <div className="px-8 py-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={session.isSyncing ? { opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className={`size-1.5 rounded-full ${session.isSyncing ? 'bg-amber-500' : 'bg-blue-500'}`}
                            />
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                {session.isSyncing ? 'Sincronizando con DB...' : 'Deep Insights Active'}
                            </span>
                        </div>
                        <div className="h-3 w-px bg-white/10" />
                        {session.lastSyncedAt && (
                            <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-[0.2em]">
                                Sincronizado {session.lastSyncedAt.toLocaleTimeString()}
                            </span>
                        )}
                        {!session.lastSyncedAt && !session.isSyncing && (
                            <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">
                                Pendiente de Sincronización
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 group cursor-help">
                        {/* Status bars decoration */}
                        {[3, 5, 2].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [h * 2, h * 4, h * 2] }}
                                transition={{ repeat: Infinity, duration: 1 + i * 0.2 }}
                                className="w-0.5 bg-white/20 group-hover:bg-blue-500/50 transition-colors"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
