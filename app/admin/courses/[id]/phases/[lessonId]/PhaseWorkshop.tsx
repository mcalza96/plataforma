'use client';

import { useMemo } from 'react';
import { useContextController } from '@/hooks/admin/phase-editor/useContextController';
import { useTimelineController } from '@/hooks/admin/phase-editor/useTimelineController';
import { useCopilotSession } from '@/hooks/admin/phase-editor/useCopilotSession';
import { useAutoSave } from '@/hooks/use-auto-save';
import { validatePhase } from '@/lib/validators/phase-editor';
import { Lesson } from '@/lib/domain/course';
import { PhaseEditorLayout } from '@/components/admin/phase-editor/Layout';
import { PhaseHeader } from '@/components/admin/phase-editor/PhaseHeader';
import { ContextPanel } from '@/components/admin/phase-editor/ContextPanel';
import { WorkbenchTimeline } from '@/components/admin/phase-editor/WorkbenchTimeline';
import { ToolsPanel } from '@/components/admin/phase-editor/ToolsPanel';

interface PhaseWorkshopClientProps {
    initialLesson: Lesson;
    courseId: string;
}

/**
 * PhaseWorkshopClient: Assembles the entire "Taller de Fase" (Workshop).
 * It uses specialized controllers (hooks) and acts as the wiring layer (Orchestrator).
 * Now with Auto-save and Real-time Validation.
 */
export default function PhaseWorkshop({ initialLesson, courseId }: PhaseWorkshopClientProps) {
    const contextCtrl = useContextController(initialLesson);
    const timelineCtrl = useTimelineController(initialLesson);
    const copilotCtrl = useCopilotSession(initialLesson.id);

    // 1. Calculate Validation Errors in real-time
    const { contextErrors, stepErrors, isValid } = useMemo(() => {
        return validatePhase(contextCtrl.lesson, timelineCtrl.steps);
    }, [contextCtrl.lesson, timelineCtrl.steps]);

    // 2. Integration: Auto-Save
    const { status: autoSaveStatus } = useAutoSave(
        { lesson: contextCtrl.lesson, steps: timelineCtrl.steps },
        async ({ steps }) => {
            // We only trigger valid saves
            if (isValid) {
                await contextCtrl.saveContext(steps);
            }
        },
        3000
    );

    // Bridge: Connect Copilot suggestions to Timeline
    const handleApplyAI = (suggestions: { title: string }[]) => {
        const newSteps = copilotCtrl.generateStepsFromSuggestions(suggestions);
        timelineCtrl.addGeneratedSteps(newSteps);
    };

    // Bridge: Connect Timeline state to Context save
    const handleSave = () => {
        contextCtrl.saveContext(timelineCtrl.steps);
    };

    // Determine aggregate status for Header
    const displayStatus = contextCtrl.status !== 'idle' ? contextCtrl.status : autoSaveStatus;

    // Feature: Scroll to first error for UX
    const scrollToFirstError = () => {
        const firstErrorEl = document.querySelector('.border-red-500\\/50');
        if (firstErrorEl) {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <PhaseEditorLayout
            header={
                <PhaseHeader
                    courseId={courseId}
                    lessonTitle={contextCtrl.lesson.title}
                    onSave={handleSave}
                    isPending={contextCtrl.isPending}
                    status={displayStatus as any}
                    errorCount={Object.keys(stepErrors).length + contextErrors.length}
                    onScrollToError={scrollToFirstError}
                />
            }
            contextPanel={
                <ContextPanel
                    lesson={contextCtrl.lesson}
                    onUpdateField={contextCtrl.updateMetadata}
                    errors={contextErrors}
                />
            }
            workbenchPanel={
                <WorkbenchTimeline
                    steps={timelineCtrl.steps}
                    onAddStep={timelineCtrl.addStep}
                    onUpdateStep={timelineCtrl.updateStep}
                    onRemoveStep={timelineCtrl.removeStep}
                    onReorderSteps={timelineCtrl.reorderSteps}
                    stepErrors={stepErrors}
                />
            }
            toolsPanel={
                <ToolsPanel
                    copilotSession={copilotCtrl}
                    onApplyAI={handleApplyAI}
                    onUpdateDownload={(url) => contextCtrl.updateMetadata('download_url', url)}
                    downloadUrl={contextCtrl.lesson.download_url}
                    lessonId={contextCtrl.lesson.id}
                />
            }
        />
    );
}
