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
    ShieldAlert,
    Sparkles,
    Loader2
} from 'lucide-react';
import { type ArchitectState } from '@/lib/domain/architect';
import { Badge as UIBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PrototypeCanvas } from './PrototypeCanvas';

interface DiagnosticBlueprintProps {
    state: ArchitectState;
    onGenerate?: () => void;
    onGeneratePrototypes?: () => void;
}

/**
 * DiagnosticBlueprint
 * The "Pedagogical Engineering" dashboard. Displays the live knowledge graph
 * extracted from the interview and validates if it's ready for generation.
 */
export function DiagnosticBlueprint({ state, onGenerate, onGeneratePrototypes }: DiagnosticBlueprintProps) {
    const { context, readiness, isGenerating, stage } = state;

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
                        {(context.keyConcepts || []).map((concept, idx) => (
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
                    {(!context.keyConcepts || context.keyConcepts.length === 0) && (
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
                        {(context.identifiedMisconceptions || []).map((item, idx) => (
                            <motion.div
                                key={item.error}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <TriangleAlert className="h-5 w-5" />
                                        <span className="font-bold text-sm">MALENTENDIDO DETECTADO</span>
                                    </div>
                                    {state.generatedProbeId && (
                                        <UIBadge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase tracking-widest px-2 py-0.5 font-black">
                                            Inyectado
                                        </UIBadge>
                                    )}
                                </div>
                                <p className="text-gray-200">{item.error}</p>
                                <div className="pl-4 border-l-2 border-emerald-500/30">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Estrategia de Refutación</p>
                                    <p className="text-emerald-400 text-sm italic">{item.refutation}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {(!context.identifiedMisconceptions || context.identifiedMisconceptions.length === 0) && (
                        <div className="bg-[#1A1A1A] border border-dashed border-amber-500/10 rounded-xl p-8 text-center">
                            <p className="text-gray-600 italic">La fase de Shadow Work aún no ha revelado confusiones cognitivas.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Prototypes Section (NEW) */}
            <AnimatePresence>
                {(context.prototypes && context.prototypes.length > 0) ? (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-[#333333]"
                    >
                        <PrototypeCanvas prototypes={context.prototypes as any} />
                    </motion.section>
                ) : (stage === 'synthesis' || readiness.isValid) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center space-y-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Sparkles className="h-8 w-8 text-emerald-400" />
                            <h3 className="text-emerald-100 font-bold">¡Blueprint Listo!</h3>
                            <p className="text-gray-400 text-sm max-w-sm">
                                Hemos capturado suficiente información pedagógica. ¿Te gustaría ver algunos prototipos de preguntas antes de generar el examen final?
                            </p>
                        </div>
                        <button
                            onClick={onGeneratePrototypes}
                            disabled={isGenerating}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 mx-auto"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            CREAR PROTOTIPO
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Injected Preview Action (NEW) */}
            <AnimatePresence>
                {state.generatedProbeId && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1A1A1A] border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-2xl shadow-blue-500/5"
                    >
                        <div className="size-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-bold">Inyección en Caliente Exitosa</h3>
                            <p className="text-gray-500 text-xs">El reactivo psicométrico ya está disponible como un bloque de Quiz en el Canvas derecho.</p>
                        </div>
                        <button
                            onClick={() => {
                                // Logic: Use a DOM scroll or focus the element if possible
                                const element = document.getElementById(`probe-step-`); // We don't have the exact ID here, but we can search for the prefix
                                const probeElement = Array.from(document.querySelectorAll('[id^="probe-step-"]')).pop();
                                if (probeElement) {
                                    probeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    (probeElement as HTMLElement).click(); // Trigger focus
                                }
                            }}
                            className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-2 group"
                        >
                            Ver en Canvas
                            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
