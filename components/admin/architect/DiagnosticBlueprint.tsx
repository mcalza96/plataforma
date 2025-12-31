'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Lightbulb,
    TriangleAlert,
    CheckCircle2,
    Zap,
    Target,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { type ArchitectState } from '@/lib/domain/architect';
import { cn } from '@/lib/utils'; // Assuming cn utility exists, if not I'll define a simple one or use template literals

interface DiagnosticBlueprintProps {
    state: ArchitectState;
    onGenerate?: () => void;
}

/**
 * DiagnosticBlueprint
 * The "Pedagogical Engineering" dashboard. Displays the live knowledge graph
 * extracted from the interview and validates if it's ready for generation.
 */
export function DiagnosticBlueprint({ state, onGenerate }: DiagnosticBlueprintProps) {
    const { context, readiness, isGenerating } = state;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10">
            {/* Header & Progress */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Zap className="text-blue-400 h-6 w-6" />
                        Blueprint de Ingeniería
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
                        <span>Readiness Index</span>
                        <div className="h-1 w-32 bg-[#252525] rounded-full overflow-hidden">
                            <motion.div
                                className={cn(
                                    "h-full transition-colors duration-500",
                                    readiness.isValid ? "bg-emerald-500" : "bg-blue-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.min(readiness.conceptCount, 3) + (readiness.misconceptionCount > 0 ? 1 : 0) + (readiness.hasTargetAudience ? 1 : 0)) * 20}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    <Users className="h-4 w-4" />
                    Perfil de Audiencia
                </div>
                <motion.div
                    layout
                    className="bg-[#252525] border border-[#333333] rounded-xl p-6 shadow-xl"
                >
                    {context.targetAudience ? (
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Target className="text-blue-400 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{context.targetAudience}</p>
                                <p className="text-gray-500 text-sm mt-1">Sujeto: {context.subject || 'No definido'}</p>
                            </div>
                            <CheckCircle2 className="ml-auto text-emerald-400 h-5 w-5" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-gray-500">
                            <div className="p-3 bg-[#1A1A1A] rounded-lg">
                                <Target className="opacity-20 h-5 w-5" />
                            </div>
                            <p className="italic">Esperando definición de audiencia en el chat...</p>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Key Concepts Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        <Lightbulb className="h-4 w-4 text-blue-400" />
                        Nodos de Conocimiento
                    </div>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-bold",
                        readiness.conceptCount >= 3 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                        {readiness.conceptCount}/3
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode='popLayout'>
                        {context.keyConcepts.map((concept, idx) => (
                            <motion.div
                                key={concept}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#252525] border border-[#333333] hover:border-blue-500/30 p-4 rounded-lg flex items-center gap-3 transition-colors group"
                            >
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-gray-100">{concept}</span>
                                <ChevronRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {context.keyConcepts.length === 0 && (
                        <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center text-gray-500 italic">
                            No se han extraído conceptos clave todavía.
                        </div>
                    )}
                </div>
            </section>

            {/* Misconceptions Section (Shadow Work) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-500 uppercase tracking-wider">
                        <ShieldAlert className="h-4 w-4" />
                        Nodos Sombra (Shadow Work)
                    </div>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-bold",
                        readiness.misconceptionCount >= 1 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                    )}>
                        {readiness.misconceptionCount}/1 Requerido
                    </span>
                </div>
                <div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                        {context.identifiedMisconceptions.map((item, idx) => (
                            <motion.div
                                key={item.error}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl space-y-3"
                            >
                                <div className="flex items-center gap-3 text-amber-500">
                                    <TriangleAlert className="h-5 w-5" />
                                    <span className="font-bold text-sm">MALENTENDIDO DETECTADO</span>
                                </div>
                                <p className="text-gray-200">{item.error}</p>
                                <div className="pl-4 border-l-2 border-emerald-500/30">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Estrategia de Refutación</p>
                                    <p className="text-emerald-400 text-sm italic">{item.refutation}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {context.identifiedMisconceptions.length === 0 && (
                        <div className="bg-[#1A1A1A] border border-dashed border-amber-500/10 rounded-xl p-8 text-center">
                            <p className="text-gray-600 italic">La fase de Shadow Work aún no ha revelado confusiones cognitivas.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Master Action Button */}
            <div className="pt-8 sticky bottom-8">
                <motion.button
                    whileHover={readiness.isValid ? { scale: 1.02 } : {}}
                    whileTap={readiness.isValid ? { scale: 0.98 } : {}}
                    disabled={!readiness.isValid || isGenerating}
                    onClick={onGenerate}
                    className={cn(
                        "w-full py-5 rounded-2xl font-bold text-lg tracking-tight shadow-2xl transition-all flex items-center justify-center gap-3",
                        readiness.isValid
                            ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                            : "bg-[#252525] text-gray-500 border border-[#333333] cursor-not-allowed"
                    )}
                >
                    {isGenerating ? (
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Generando...
                        </div>
                    ) : (
                        <>
                            GENERAR INSTRUMENTO DE DIAGNÓSTICO
                            <ChevronRight className={cn("h-5 w-5", readiness.isValid ? "text-white" : "text-gray-600")} />
                        </>
                    )}
                </motion.button>
                {!readiness.isValid && (
                    <p className="text-center text-xs text-gray-500 mt-4 font-medium uppercase tracking-widest">
                        Bloqueado: Se requieren al menos 3 conceptos y 1 malentendido para proceder.
                    </p>
                )}
            </div>
        </div>
    );
}
