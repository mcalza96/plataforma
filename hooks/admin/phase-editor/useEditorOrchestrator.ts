'use client';

import { useState, useMemo } from 'react';
import { useContextController } from './useContextController';
import { useTimelineController } from './useTimelineController';
import { useCopilotSession } from './useCopilotSession';
import { Lesson } from '@/lib/domain/course';
import { validatePhase } from '@/lib/validators/phase-editor';
import { useAutoSave } from '@/hooks/use-auto-save';

/**
 * useEditorOrchestrator: The master "brain" of the Creative Studio.
 * It coordinates multiple sub-controllers and manages cross-domain side effects.
 */
export function useEditorOrchestrator(initialLesson: Lesson) {
    const context = useContextController(initialLesson);
    const timeline = useTimelineController(initialLesson);

    // UI State: Track which block is currently under focus
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // Bridge Method: Handle applying AI suggestions with visual feedback
    const handleApplySuggestions = (suggestions: { title: string }[]) => {
        const newSteps = copilot.generateStepsFromSuggestions(suggestions);
        timeline.addGeneratedSteps(newSteps);

        // UX: Scroll to the newly created content smoothly
        if (newSteps.length > 0) {
            const firstNewStepId = newSteps[0].id;
            // Delay slightly to allow React to render the new steps
            setTimeout(() => {
                const element = document.getElementById(firstNewStepId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setSelectedBlockId(firstNewStepId);
                }
            }, 100);
        }
    };

    // Instance the copilot with dynamic external context awareness
    const copilot = useCopilotSession(
        initialLesson.id,
        { selectedBlockId, currentSteps: timeline.steps },
        handleApplySuggestions
    );

    // 1. Centralized Real-time Validation
    const { contextErrors, stepErrors, isValid } = useMemo(() => {
        return validatePhase(context.lesson, timeline.steps);
    }, [context.lesson, timeline.steps]);

    // 2. Centralized Auto-Save logic
    const { status: autoSaveStatus } = useAutoSave(
        { lesson: context.lesson, steps: timeline.steps },
        async ({ steps }) => {
            if (isValid) {
                await context.saveContext(steps);
            }
        },
        3000
    );

    // Bridge Method: Focus a block and notify the system
    const focusBlock = (id: string | null) => {
        setSelectedBlockId(id);
        // We could also trigger specific AI insights here if needed
    };



    // Bridge Method: Save all changes manually
    const handleManualSave = () => {
        if (isValid) {
            context.saveContext(timeline.steps);
        }
    };

    return {
        context,
        timeline,
        copilot: {
            ...copilot,
            onApplySuggestions: handleApplySuggestions
        },
        ui: {
            selectedBlockId,
            focusBlock,
            contextErrors,
            stepErrors,
            isValid,
            autoSaveStatus,
            handleManualSave
        }
    };
}
