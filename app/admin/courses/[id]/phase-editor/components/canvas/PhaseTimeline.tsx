'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import StepCard, { StepData } from '@/components/admin/StepCard';

interface PhaseTimelineProps {
    steps: StepData[];
    onAddStep: () => void;
    onUpdateStep: (id: string, updates: Partial<StepData>) => void;
    onRemoveStep: (id: string) => void;
    onReorderSteps: (activeId: string, overId: string) => void;
    stepErrors?: Record<string, string[]>;
    selectedStepId?: string | null;
    onFocusStep?: (id: string) => void;
}

/**
 * PhaseTimeline: A clean, document-integrated version of the lesson timeline.
 * Steps float directly on the canvas with subtle connectors.
 */
export function PhaseTimeline({
    steps,
    onAddStep,
    onUpdateStep,
    onRemoveStep,
    onReorderSteps,
    stepErrors = {},
    selectedStepId,
    onFocusStep
}: PhaseTimelineProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setExpandedId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorderSteps(active.id.toString(), over.id.toString());
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header / Stats */}
            <div className="flex items-end justify-between px-2">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Secuencia Maestra</h2>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Arquitectura del Despliegue</p>
                </div>
                <div className="text-right">
                    <span className="text-5xl font-black italic text-white/5">{steps.length}</span>
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Módulos</p>
                </div>
            </div>

            {/* Timeline with DND */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={steps.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {steps.map((item, index) => (
                            <div key={item.id} className="relative group">
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-[34px] top-20 bottom-0 w-[1px] bg-white/5 z-0 group-hover:bg-amber-500/20 transition-colors" />
                                )}

                                <StepCard
                                    step={item}
                                    index={index}
                                    isExpanded={expandedId === item.id}
                                    isSelected={selectedStepId === item.id}
                                    onFocus={() => onFocusStep?.(item.id)}
                                    onToggleExpand={() => {
                                        setExpandedId(expandedId === item.id ? null : item.id);
                                        onFocusStep?.(item.id);
                                    }}
                                    onUpdate={onUpdateStep}
                                    onRemove={onRemoveStep}
                                    errors={stepErrors[item.id]}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Step Button - Zen Style */}
            <button
                onClick={onAddStep}
                className="w-full py-16 border border-white/5 rounded-[2.5rem] bg-white/[0.02] text-gray-600 hover:text-amber-500 hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all flex flex-col items-center justify-center gap-4 group active:scale-[0.99]"
            >
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 group-hover:rotate-90">
                    <span className="material-symbols-outlined !text-2xl">add</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inyectar Módulo Atómico</span>
            </button>
        </div>
    );
}
