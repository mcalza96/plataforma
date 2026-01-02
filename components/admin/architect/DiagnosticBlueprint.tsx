'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, CheckCircle2, Zap, ChevronRight } from 'lucide-react';
import { type ArchitectState } from '@/lib/domain/architect';
import { PrototypeCanvas } from './PrototypeCanvas';
import { BlueprintHeader } from './BlueprintHeader';
import { BlueprintConceptList } from './BlueprintConceptList';
import { BlueprintShadowBoard } from './BlueprintShadowBoard';
import { BlueprintActions } from './BlueprintActions';

interface DiagnosticBlueprintProps {
    state: ArchitectState;
    onGenerate?: () => void;
    onGeneratePrototypes?: () => void;
}

/**
 * DiagnosticBlueprint
 * Refactored into specialized sub-components to adhere to SRP.
 */
export function DiagnosticBlueprint({ state, onGenerate, onGeneratePrototypes }: DiagnosticBlueprintProps) {
    const { context, readiness } = state;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10">
            <BlueprintHeader readiness={readiness} />

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

            <BlueprintConceptList context={context} readiness={readiness} />

            <BlueprintShadowBoard
                context={context}
                readiness={readiness}
                generatedProbeId={state.generatedProbeId}
            />

            {/* Prototypes Section */}
            <AnimatePresence>
                {(context.prototypes && context.prototypes.length > 0) && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-[#333333]"
                    >
                        <PrototypeCanvas prototypes={context.prototypes as any} />
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Injected Preview Action */}
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
                                const probeElement = Array.from(document.querySelectorAll('[id^="probe-step-"]')).pop();
                                if (probeElement) {
                                    probeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    (probeElement as HTMLElement).click();
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

            <BlueprintActions
                state={state}
                onGenerate={onGenerate}
                onGeneratePrototypes={onGeneratePrototypes}
            />
        </div>
    );
}
