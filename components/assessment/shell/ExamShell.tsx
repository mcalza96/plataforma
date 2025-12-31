'use client';

import React, { useState, useEffect, memo } from 'react';
import { ExamSidebar } from './ExamSidebar';
import { LegoCBM } from '../legos/LegoCBM';
import { LegoRanking } from '../legos/LegoRanking';
import { LegoSpotting } from '../legos/LegoSpotting';
import { useExamSync } from '@/hooks/useExamSync';
import { useRouter } from 'next/navigation';
import {
    Question,
    QuestionMetadata,
    AnswerPayload,
} from '@/lib/domain/assessment';
import { WifiOff, AlertTriangle } from 'lucide-react';

interface ExamShellProps {
    questions: Question[];
    onComplete: (answers: AnswerPayload[]) => void;
}

/**
 * ExamShell - Main Orchestrator for Non-Linear Navigation
 * Manages question state, navigation, and answer collection
 */
export const ExamShell = memo(function ExamShell({
    questions,
    attemptId,
    examId,
}: { questions: Question[], attemptId: string, examId: string }) {
    const router = useRouter();
    const {
        trackEvent,
        trackAnswer,
        sync,
    } = useExamSync(attemptId, {}); // Initialize sync hook

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionMetadata, setQuestionMetadata] = useState<QuestionMetadata[]>(
        () =>
            questions.map((q) => ({
                id: q.id,
                state: 'NOT_SEEN' as const,
                isFlagged: false,
            }))
    );
    const [answers, setAnswers] = useState<Map<string, AnswerPayload>>(new Map());
    const [isOffline, setIsOffline] = useState(false);

    // Monitor Online/Offline status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const currentQuestion = questions[currentQuestionIndex];

    // Mark current question as SEEN when navigating to it
    useEffect(() => {
        setQuestionMetadata((prev) =>
            prev.map((meta, index) =>
                index === currentQuestionIndex && meta.state === 'NOT_SEEN'
                    ? { ...meta, state: 'SEEN' }
                    : meta
            )
        );
    }, [currentQuestionIndex]);

    const handleAnswer = (payload: AnswerPayload) => {
        // Telemetry: Log the answer update
        trackAnswer(payload.questionId, payload.value);

        // Save local state for UI indicators
        setAnswers((prev) => new Map(prev).set(payload.questionId, payload));

        // Update metadata
        setQuestionMetadata((prev) =>
            prev.map((meta) =>
                meta.id === payload.questionId
                    ? { ...meta, state: 'ANSWERED' }
                    : meta
            )
        );

        // Auto-navigate to next question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleToggleFlag = () => {
        const isCurrentlyFlagged = questionMetadata[currentQuestionIndex]?.isFlagged;

        trackEvent({
            event_type: 'NAVIGATION',
            payload: {
                action: isCurrentlyFlagged ? 'UNFLAG' : 'FLAG',
                questionId: currentQuestion.id
            }
        });

        setQuestionMetadata((prev) =>
            prev.map((meta, index) =>
                index === currentQuestionIndex
                    ? { ...meta, isFlagged: !meta.isFlagged }
                    : meta
            )
        );
    };

    const handleDontKnow = () => {
        const payload: AnswerPayload = {
            questionId: currentQuestion.id,
            value: null,
            isGap: true,
            telemetry: {
                timeMs: 0,
                hesitationCount: 0,
                focusLostCount: 0,
            },
        };

        handleAnswer(payload);
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleFinish = async () => {
        if (isOffline) {
            alert("No tienes conexión a internet. Reconéctate para poder finalizar y enviar tu examen.");
            return;
        }

        if (!confirm('¿Estás seguro de que deseas finalizar el examen?')) return;

        try {
            // 1. Force final sync (flush telemetry)
            await sync();

            // 2. Call server action to finalize and evaluate
            const { finalizeAttempt } = await import('@/lib/actions/exam-actions');
            const result = await finalizeAttempt(attemptId);

            if (result.success) {
                // 3. Redirect to results
                router.push(`/assessment/${examId}/results`);
            } else {
                alert(`Error al finalizar: ${result.error}`);
            }
        } catch (error) {
            console.error("Finish error:", error);
            alert("Ocurrió un error crítico al finalizar el examen.");
        }
    };

    const renderLego = () => {
        if (!currentQuestion) return null;

        const commonProps = {
            questionId: currentQuestion.id,
            stem: currentQuestion.stem,
            onAnswer: handleAnswer,
        };

        switch (currentQuestion.type) {
            case 'CBM':
                return <LegoCBM {...commonProps} options={currentQuestion.options} />;
            case 'RANKING':
                return <LegoRanking {...commonProps} items={currentQuestion.items} />;
            case 'SPOTTING':
                return (
                    <LegoSpotting
                        {...commonProps}
                        text={currentQuestion.text}
                        interactiveSegments={currentQuestion.interactiveSegments}
                    />
                );
            default:
                return null;
        }
    };

    const allAnswered = questionMetadata.every((q) => q.state === 'ANSWERED');

    return (
        <div className="flex h-screen bg-[#1A1A1A] relative">
            {/* Offline Banner */}
            {isOffline && (
                <div className="absolute top-0 left-0 right-0 z-[200] bg-amber-500 text-black px-6 py-3 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-2xl animate-in slide-in-from-top duration-500">
                    <WifiOff size={18} />
                    Sin conexión a internet. Sigue respondiendo, tus datos se sincronizarán al volver.
                    <AlertTriangle size={18} className="animate-pulse" />
                </div>
            )}

            {/* Sidebar */}
            <ExamSidebar
                questions={questionMetadata}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={setCurrentQuestionIndex}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">{renderLego()}</div>
                </div>

                {/* Bottom Toolbar */}
                <div className="border-t border-white/5 bg-[#252525] p-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        {/* Left Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleFlag}
                                aria-label={
                                    questionMetadata[currentQuestionIndex]?.isFlagged
                                        ? 'Desmarcar para revisar'
                                        : 'Marcar para revisar'
                                }
                                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all
                  ${questionMetadata[currentQuestionIndex]?.isFlagged
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-yellow-500/30'
                                    }
                `}
                            >
                                🚩 {questionMetadata[currentQuestionIndex]?.isFlagged ? 'Marcada' : 'Marcar'}
                            </button>

                            <button
                                onClick={handleDontKnow}
                                aria-label="No sé - Saltar validaciones"
                                className="px-4 py-2 rounded-lg font-semibold bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                            >
                                ❓ No sé
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                aria-label="Pregunta anterior"
                                className="px-6 py-2 rounded-lg font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                ← Anterior
                            </button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    aria-label="Siguiente pregunta"
                                    className="px-6 py-2 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-all"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinish}
                                    disabled={!allAnswered}
                                    aria-label="Finalizar examen"
                                    className="px-6 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ✓ Finalizar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
