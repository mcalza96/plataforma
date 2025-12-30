'use client';

import { Lesson } from '@/lib/domain/course';
import { EditorLayout } from '../../phase-editor/components/shell/EditorLayout';
import { CopilotShell } from '../../phase-editor/components/intelligence/CopilotShell';
import { PhaseDocument } from '../../phase-editor/components/canvas/PhaseDocument';
import { PhaseHeader } from '@/components/admin/phase-editor/PhaseHeader';

import { useEditorOrchestrator } from '@/hooks/admin/phase-editor/useEditorOrchestrator';

interface PhaseWorkshopClientProps {
    initialLesson: Lesson;
    courseId: string;
}

/**
 * PhaseWorkshop: Assembles the entire "Taller de Fase" (Workshop).
 * Now using the "Creative Studio" master orchestrator.
 */
export default function PhaseWorkshop({ initialLesson, courseId }: PhaseWorkshopClientProps) {
    const editor = useEditorOrchestrator(initialLesson);

    // Feature: Scroll to first error for UX
    const scrollToFirstError = () => {
        const firstErrorEl = document.querySelector('.border-red-500\\/50');
        if (firstErrorEl) {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const displayStatus = editor.context.status !== 'idle'
        ? editor.context.status
        : editor.ui.autoSaveStatus;

    return (
        <EditorLayout
            actions={
                <PhaseHeader
                    courseId={courseId}
                    lessonTitle={editor.context.lesson.title}
                    onSave={editor.ui.handleManualSave}
                    isPending={editor.context.isPending}
                    status={displayStatus as any}
                    errorCount={Object.keys(editor.ui.stepErrors).length + editor.ui.contextErrors.length}
                    onScrollToError={scrollToFirstError}
                    isValid={editor.ui.isValid}
                />
            }
            intelligence={
                <CopilotShell session={editor.copilot} />
            }
            canvas={
                <PhaseDocument
                    lesson={editor.context.lesson}
                    steps={editor.timeline.steps}
                    onUpdateField={editor.context.updateMetadata}
                    onAddStep={editor.timeline.addStep}
                    onUpdateStep={editor.timeline.updateStep}
                    onRemoveStep={editor.timeline.removeStep}
                    onReorderSteps={editor.timeline.reorderSteps}
                    contextErrors={editor.ui.contextErrors}
                    stepErrors={editor.ui.stepErrors}
                    selectedBlockId={editor.ui.selectedBlockId}
                    onFocusBlock={editor.ui.focusBlock}
                />
            }
        />
    );
}
