'use client';

import { usePhaseEditor } from '@/hooks/admin/use-phase-editor';
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
 * It uses the controller (hook) and delegates rendering to specialized panels.
 */
export default function PhaseWorkshop({ initialLesson, courseId }: PhaseWorkshopClientProps) {
    const editor = usePhaseEditor(initialLesson);

    return (
        <PhaseEditorLayout
            header={
                <PhaseHeader
                    courseId={courseId}
                    lessonTitle={editor.lesson.title}
                    onSave={editor.saveChanges}
                    isPending={editor.isPending}
                    status={editor.status}
                />
            }
            leftPanel={
                <ContextPanel
                    lesson={editor.lesson}
                    onUpdateField={editor.updateField}
                />
            }
            mainPanel={
                <WorkbenchTimeline
                    steps={editor.steps}
                    onAddStep={editor.addStep}
                    onUpdateStep={editor.updateStep}
                    onRemoveStep={editor.removeStep}
                    onReorderSteps={editor.reorderSteps}
                />
            }
            rightPanel={
                <ToolsPanel
                    onApplyAI={editor.applyAISuggestions}
                    onUpdateDownload={(url) => editor.updateField('download_url', url)}
                    downloadUrl={editor.lesson.download_url}
                />
            }
        />
    );
}
