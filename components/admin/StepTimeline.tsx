'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableStepItem } from './SortableStepItem';
import { useState, useEffect } from 'react';

interface Step {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'resource';
}

interface StepTimelineProps {
    initialStepsCount: number;
    onChange: (count: number) => void;
}

export default function StepTimeline({ initialStepsCount, onChange }: StepTimelineProps) {
    const [items, setItems] = useState<Step[]>([]);

    useEffect(() => {
        // Inicializar pasos si la lista está vacía
        if (items.length === 0 && initialStepsCount > 0) {
            const initialItems: Step[] = Array.from({ length: initialStepsCount }, (_, i) => ({
                id: `step-${i}-${Date.now()}`,
                title: `Paso ${i + 1}`,
                type: 'video'
            }));
            setItems(initialItems);
        }
    }, [initialStepsCount]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleUpdateTitle = (id: string, title: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, title } : item));
    };

    const handleRemove = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onChange(newItems.length);
    };

    const handleAddStep = () => {
        const newStep: Step = {
            id: `step-${Date.now()}`,
            title: `Nuevo Paso ${items.length + 1}`,
            type: 'video'
        };
        const newItems = [...items, newStep];
        setItems(newItems);
        onChange(newItems.length);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Línea de Tiempo Atómica</h3>
                    <p className="text-[10px] text-gray-600 font-medium italic">Arrastra para reordenar la secuencia de aprendizaje.</p>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic text-amber-500">{items.length}</span>
                    <span className="text-[10px] font-black text-amber-500/50 uppercase">Bloques</span>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <SortableStepItem
                                key={item.id}
                                id={item.id}
                                index={index}
                                title={item.title}
                                onUpdateTitle={handleUpdateTitle}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={handleAddStep}
                className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
                <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">add_circle</span>
                Añadir Ladrillo de Aprendizaje
            </button>
        </div>
    );
}
