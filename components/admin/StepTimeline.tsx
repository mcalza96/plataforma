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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import StepCard, { StepData, StepType } from './StepCard';

interface StepTimelineProps {
    initialStepsCount: number;
    onChange: (count: number) => void;
}

export default function StepTimeline({ initialStepsCount, onChange }: StepTimelineProps) {
    const [items, setItems] = useState<StepData[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        // Inicializar pasos si la lista está vacía
        if (items.length === 0 && initialStepsCount > 0) {
            const initialItems: StepData[] = Array.from({ length: initialStepsCount }, (_, i) => ({
                id: `step-${i}-${Date.now()}`,
                title: `Paso ${i + 1}`,
                description: '',
                type: 'video',
                duration: 5
            }));
            setItems(initialItems);
        }
    }, [initialStepsCount]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Sensibilidad para no disparar drag al clickear para expandir
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        // Al arrastrar, colapsamos cualquier ladrillo abierto para optimizar el espacio visual
        setExpandedId(null);
    };

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

    const handleUpdate = (id: string, updates: Partial<StepData>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleRemove = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        onChange(newItems.length);
        if (expandedId === id) setExpandedId(null);
    };

    const handleAddStep = () => {
        const newStep: StepData = {
            id: `step-${Date.now()}`,
            title: `Nuevo Paso ${items.length + 1}`,
            description: '',
            type: 'video',
            duration: 5
        };
        const newItems = [...items, newStep];
        setItems(newItems);
        onChange(newItems.length);
        setExpandedId(newStep.id); // Expandir automáticamente el nuevo
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Plan de Despliegue</h3>
                    <p className="text-[10px] text-gray-600 font-bold italic">Secuencia táctica de ladrillos de aprendizaje.</p>
                </div>
                <div className="flex items-baseline gap-1 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-xl font-black italic text-amber-500">{items.length}</span>
                    <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Bloques</span>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <StepCard
                                key={item.id}
                                step={item}
                                index={index}
                                isExpanded={expandedId === item.id}
                                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={handleAddStep}
                className="w-full py-6 border-2 border-dashed border-white/5 rounded-3xl text-gray-600 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform duration-500">add</span>
                </div>
                Acoplar Nuevo Ladrillo Atómico
            </button>
        </div>
    );
}
