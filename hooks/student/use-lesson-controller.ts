'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { toggleStepCompletion } from '@/lib/actions/student/lesson-actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface UseLessonControllerProps {
    courseId: string;
    studentId: string;
    lessonId: string;
    totalSteps: number;
    initialCompletedSteps: number;
    nextLessonId?: string;
}

/**
 * Custom hook to manage the state and logic for the lesson view.
 * Handles optimistic updates, transitions, and celebration logic.
 */
export function useLessonController({
    courseId,
    studentId,
    lessonId,
    totalSteps,
    initialCompletedSteps,
    nextLessonId
}: UseLessonControllerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [completedSteps, setCompletedSteps] = useState(initialCompletedSteps);
    const [showCelebration, setShowCelebration] = useState(false);

    // Optimistic state for completed steps
    const [optimisticSteps, setOptimisticSteps] = useOptimistic(
        completedSteps,
        (state, newCount: number) => newCount
    );

    const isLessonComplete = optimisticSteps >= totalSteps;

    const handleStepToggle = async (stepIndex: number) => {
        const isCurrentlyCompleted = stepIndex <= optimisticSteps;
        let newCount = completedSteps;

        if (isCurrentlyCompleted) {
            // If they click a step that is already completed, we toggle back to the previous step
            newCount = stepIndex - 1;
        } else {
            // If they click a future step, we jump to it
            newCount = stepIndex;
        }

        // Check if just completed the whole lesson (optimistically)
        if (newCount >= totalSteps && !isLessonComplete) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
        }

        startTransition(async () => {
            setOptimisticSteps(newCount);
            try {
                // LLamada a la Server Action (Infraestructura)
                await toggleStepCompletion(studentId, lessonId, newCount, totalSteps, courseId);
                setCompletedSteps(newCount);
            } catch (error) {
                showToast("No pudimos guardar tu progreso. Inténtalo de nuevo.", "error");
            }
        });
    };

    const handleNextLesson = () => {
        if (nextLessonId) {
            router.push(`/lessons/${courseId}?lessonId=${nextLessonId}`);
        } else {
            router.push('/dashboard');
        }
    };

    return {
        optimisticSteps,
        isLessonComplete,
        isPending,
        showCelebration,
        setShowCelebration,
        handleStepToggle,
        handleNextLesson
    };
}
