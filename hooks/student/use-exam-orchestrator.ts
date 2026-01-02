import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExamSync } from '@/hooks/student/use-exam-sync';
import { Question, QuestionMetadata, AnswerPayload } from '@/lib/domain/assessment';

export function useExamOrchestrator(questions: Question[], attemptId: string, examId: string) {
    const router = useRouter();
    const {
        trackEvent,
        trackAnswer,
        sync,
        isHydrating,
        currentAnswers
    } = useExamSync(attemptId, {});

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questionMetadata, setQuestionMetadata] = useState<QuestionMetadata[]>(
        () => questions.map((q) => ({ id: q.id, state: 'NOT_SEEN' as const, isFlagged: false }))
    );
    const [answers, setAnswers] = useState<Map<string, any>>(new Map());
    const [revisitCounts, setRevisitCounts] = useState<Map<string, number>>(new Map());
    const [isOffline, setIsOffline] = useState(false);

    // Hydration Sync
    useEffect(() => {
        if (!isHydrating && Object.keys(currentAnswers).length > 0) {
            setQuestionMetadata(prev => prev.map(meta => ({
                ...meta,
                state: currentAnswers[meta.id] ? 'ANSWERED' : meta.state
            })));

            setAnswers(prev => {
                const newMap = new Map(prev);
                Object.entries(currentAnswers).forEach(([qId, value]) => {
                    if (!newMap.has(qId)) newMap.set(qId, value);
                });
                return newMap;
            });
        }
    }, [isHydrating, currentAnswers]);

    // Offline Monitor
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Navigation & Revisit Tracking
    useEffect(() => {
        setQuestionMetadata((prev) =>
            prev.map((meta, index) =>
                index === currentQuestionIndex && meta.state === 'NOT_SEEN'
                    ? { ...meta, state: 'SEEN' }
                    : meta
            )
        );

        const currentQuestionId = questions[currentQuestionIndex]?.id;
        const currentMeta = questionMetadata[currentQuestionIndex];
        if (currentQuestionId && currentMeta && (currentMeta.state === 'SEEN' || currentMeta.state === 'ANSWERED')) {
            setRevisitCounts(prev => {
                const newMap = new Map(prev);
                const currentCount = newMap.get(currentQuestionId) || 0;
                newMap.set(currentQuestionId, currentCount + 1);
                return newMap;
            });
        }
    }, [currentQuestionIndex]);

    const handleAnswer = useCallback((payload: AnswerPayload) => {
        const currentRevisitCount = revisitCounts.get(payload.questionId) || 0;
        const enrichedTelemetry = { ...payload.telemetry, revisitCount: currentRevisitCount };

        trackAnswer(payload.questionId, payload.value, enrichedTelemetry);
        setAnswers((prev) => new Map(prev).set(payload.questionId, payload.value));
        setQuestionMetadata((prev) =>
            prev.map((meta) => meta.id === payload.questionId ? { ...meta, state: 'ANSWERED' } : meta)
        );

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    }, [questions.length, currentQuestionIndex, trackAnswer, revisitCounts]);

    const toggleFlag = useCallback(() => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCurrentlyFlagged = questionMetadata[currentQuestionIndex]?.isFlagged;

        trackEvent({
            event_type: 'NAVIGATION',
            payload: { action: isCurrentlyFlagged ? 'UNFLAG' : 'FLAG', questionId: currentQuestion.id }
        });

        setQuestionMetadata((prev) =>
            prev.map((meta, index) => index === currentQuestionIndex ? { ...meta, isFlagged: !meta.isFlagged } : meta)
        );
    }, [questions, currentQuestionIndex, questionMetadata, trackEvent]);

    const handleDontKnow = useCallback(() => {
        const currentQuestion = questions[currentQuestionIndex];
        handleAnswer({
            questionId: currentQuestion.id,
            value: null,
            isGap: true,
            telemetry: { timeMs: 0, hesitationCount: 0, focusLostCount: 0, hoverTimeMs: 0, revisitCount: 0 }
        });
    }, [questions, currentQuestionIndex, handleAnswer]);

    const finishExam = useCallback(async () => {
        if (isOffline) {
            alert("No tienes conexión a internet. Reconéctate para poder finalizar y enviar tu examen.");
            return;
        }
        if (!confirm('¿Estás seguro de que deseas finalizar el examen?')) return;

        try {
            await sync();
            const { finalizeAttempt } = await import('@/lib/actions/assessment/exam-actions');
            const finalSnapshot = Object.fromEntries(answers);
            const result = await finalizeAttempt(attemptId, finalSnapshot);

            if (result.success) {
                router.push(`/assessment/${examId}/results`);
            } else {
                alert(`Error al finalizar: ${result.error}`);
            }
        } catch (error) {
            console.error("Finish error:", error);
            alert(`Ocurrió un error crítico al finalizar el examen.`);
        }
    }, [isOffline, sync, attemptId, answers, examId, router]);

    return {
        currentQuestionIndex,
        setCurrentQuestionIndex,
        questionMetadata,
        isOffline,
        handleAnswer,
        toggleFlag,
        handleDontKnow,
        finishExam,
        isHydrating,
        currentQuestion: questions[currentQuestionIndex],
        allAnswered: useMemo(() => questionMetadata.every((q) => q.state === 'ANSWERED'), [questionMetadata])
    };
}
