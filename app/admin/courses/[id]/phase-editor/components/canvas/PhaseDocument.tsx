'use client';

import React, { ReactNode } from 'react';
import { Lesson } from '@/lib/domain/course';
import { StepData } from '@/components/admin/StepCard';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { PhaseMetadata } from './PhaseMetadata';
import { PhaseTimeline } from './PhaseTimeline';

interface PhaseDocumentProps {
    lesson: Lesson;
    steps: StepData[];
    onUpdateField: (field: keyof Lesson, value: any) => void;
    onAddStep: () => void;
    onUpdateStep: (id: string, updates: Partial<StepData>) => void;
    onRemoveStep: (id: string) => void;
    onReorderSteps: (activeId: string, overId: string) => void;
    contextErrors?: string[];
    stepErrors?: Record<string, string[]>;
    selectedBlockId?: string | null;
    onFocusBlock?: (id: string | null) => void;
    liveContext?: PartialKnowledgeMap;
}

/**
 * PhaseDocument: The main continuous document assembler for the Canvas.
 * It coordinates the editorial metadata and the interactive timeline.
 */
export function PhaseDocument({
    lesson,
    steps,
    onUpdateField,
    onAddStep,
    onUpdateStep,
    onRemoveStep,
    onReorderSteps,
    contextErrors,
    stepErrors,
    selectedBlockId,
    onFocusBlock,
    liveContext
}: PhaseDocumentProps) {
    return (
        <div className="w-full min-h-full bg-transparent">
            {/* The "Paper" container */}
            <div className="max-w-4xl mx-auto py-24 px-6 lg:px-8 space-y-24">
                {/* 1. Cinematic Header & Editorial Metadata */}
                <PhaseMetadata
                    lesson={lesson}
                    onUpdateField={onUpdateField}
                    errors={contextErrors}
                />

                {/* 2. Deployment Map (Timeline) */}
                <PhaseTimeline
                    steps={steps}
                    onAddStep={onAddStep}
                    onUpdateStep={onUpdateStep}
                    onRemoveStep={onRemoveStep}
                    onReorderSteps={onReorderSteps}
                    stepErrors={stepErrors}
                    selectedStepId={selectedBlockId}
                    onFocusStep={onFocusBlock}
                    liveContext={liveContext}
                />
            </div>

            {/* Footer / End of Document indicator */}
            <footer className="max-w-4xl mx-auto py-20 border-t border-white/5 flex flex-col items-center gap-4">
                <div className="size-2 bg-white/10 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/5">Fin de la Estructura</p>
            </footer>
        </div>
    );
}
