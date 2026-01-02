import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchitectState } from '@/lib/domain/architect';

export const BlueprintActions = ({
    state,
    onGenerate,
    onGeneratePrototypes
}: {
    state: ArchitectState,
    onGenerate?: () => void,
    onGeneratePrototypes?: () => void
}) => {
    const { readiness, isGenerating, stage } = state;

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {(stage === 'synthesis' || readiness.isValid) && (!state.context.prototypes || state.context.prototypes.length === 0) && (
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
};
