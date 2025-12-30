'use client';

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
import { useState } from 'react';
import StepCard, { StepData } from '../StepCard';

interface WorkbenchTimelineProps {
    steps: StepData[];
    onAddStep: () => void;
    onUpdateStep: (id: string, updates: Partial<StepData>) => void;
    onRemoveStep: (id: string) => void;
    onReorderSteps: (activeId: string, overId: string) => void;
}

/**
 * ISP: WorkbenchTimeline is the central "Lego board" where steps are organized.
 * Controlled component that receives its state from the hook.
 */
export function WorkbenchTimeline({
    steps,
    onAddStep,
    onUpdateStep,
    onRemoveStep,
    onReorderSteps
}: WorkbenchTimelineProps) {
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Legend / Info */}
            <div className="flex items-center justify-between px-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Mapa de Despliegue</h2>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic">Organiza la secuencia lógica del aprendizaje.</p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-900 px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
                    <span className="text-2xl font-black italic text-amber-500">{steps.length}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bloques</span>
                </div>
            </div>

            {/* Timeline Area */}
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
                    <div className="space-y-6">
                        {steps.map((item, index) => (
                            <StepCard
                                key={item.id}
                                step={item}
                                index={index}
                                isExpanded={expandedId === item.id}
                                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                onUpdate={onUpdateStep}
                                onRemove={onRemoveStep}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Quick Action Button */}
            <button
                onClick={onAddStep}
                className="w-full py-10 border-2 border-dashed border-white/5 rounded-[3rem] text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all text-sm font-black uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-4 group active:scale-[0.98] shadow-2xl"
            >
                <div className="size-12 rounded-[1.2rem] bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <span className="material-symbols-outlined !text-2xl group-hover:rotate-90 transition-transform duration-700">add</span>
                </div>
                Acoplar Ladrillo Atómico
            </button>
        </div>
    );
}
