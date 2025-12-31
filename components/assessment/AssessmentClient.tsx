'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticProbe } from '@/lib/domain/assessment';
import { submitAssessment } from '@/lib/assessment-actions';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface AssessmentClientProps {
    probe: DiagnosticProbe;
}

/**
 * AssessmentClient
 * Immersive UI for the student to complete a diagnostic probe.
 * Features: Tactile interaction, real-time triage feedback, and celebratory effects.
 */
export default function AssessmentClient({ probe }: AssessmentClientProps) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{
        feedback: string;
        isMastery: boolean;
        isMisconception: boolean;
    } | null>(null);

    const handleSelect = (optionId: string | undefined) => {
        if (result || !optionId) return;
        setSelectedId(optionId);
    };

    const handleSubmit = async () => {
        if (!selectedId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const data = await submitAssessment(probe.id, selectedId);
            setResult(data as any);

            if (data.isMastery) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#ffffff']
                });
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Algo salió mal. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-[#0F0F0F] text-white">
            <div className="w-full max-w-3xl space-y-12">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-8"
                        >
                            {/* Question Stem */}
                            <div className="space-y-4">
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Evaluación Diagnóstica</span>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                                    {probe.stem}
                                </h1>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {probe.options.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        whileHover={!isSubmitting ? { scale: 1.01, backgroundColor: '#1A1A1A' } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        onClick={() => handleSelect(option.id)}
                                        className={cn(
                                            "w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                                            selectedId === option.id
                                                ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                                : "border-[#252525] bg-[#151515] hover:border-[#333333]"
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <span className={cn(
                                            "text-lg font-medium",
                                            selectedId === option.id ? "text-blue-400" : "text-gray-300"
                                        )}>
                                            {option.content}
                                        </span>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedId === option.id
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-[#333333] group-hover:border-gray-500"
                                        )}>
                                            {selectedId === option.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedId || isSubmitting}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all flex items-center justify-center gap-3",
                                        selectedId && !isSubmitting
                                            ? "bg-white text-black hover:bg-gray-200 shadow-xl"
                                            : "bg-[#252525] text-gray-600 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            Enviar Respuesta
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Feedback Card */}
                            <div className={cn(
                                "p-10 rounded-[2.5rem] border-2 shadow-2xl space-y-8 relative overflow-hidden",
                                result.isMastery
                                    ? "bg-emerald-500/5 border-emerald-500/30"
                                    : result.isMisconception
                                        ? "bg-amber-500/5 border-amber-500/30"
                                        : "bg-blue-500/5 border-blue-500/30"
                            )}>
                                {/* Glow Effect */}
                                <div className={cn(
                                    "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full",
                                    result.isMastery ? "bg-emerald-500" : result.isMisconception ? "bg-amber-500" : "bg-blue-500"
                                )} />

                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className={cn(
                                        "p-4 rounded-2xl",
                                        result.isMastery ? "bg-emerald-500/20" : result.isMisconception ? "bg-amber-500/20" : "bg-blue-500/20"
                                    )}>
                                        {result.isMastery ? (
                                            <Rocket className="h-10 w-10 text-emerald-400" />
                                        ) : result.isMisconception ? (
                                            <AlertCircle className="h-10 w-10 text-amber-400" />
                                        ) : (
                                            <Rocket className="h-10 w-10 text-blue-400" />
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className={cn(
                                            "text-3xl font-black italic tracking-tighter uppercase",
                                            result.isMastery ? "text-emerald-400" : result.isMisconception ? "text-amber-400" : "text-blue-400"
                                        )}>
                                            {result.isMastery ? "¡Objetivo Logrado!" : result.isMisconception ? "Insight Constructivo" : "Próximos Pasos"}
                                        </h2>
                                        <p className="text-xl text-gray-300 font-medium max-w-md leading-relaxed">
                                            {result.feedback}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg tracking-tight shadow-2xl flex items-center justify-center gap-3"
                            >
                                Continuar a mi Ruta Personalizada
                                <ArrowRight className="h-5 w-5" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
