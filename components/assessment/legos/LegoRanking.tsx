'use client';

import React, { useState, useEffect, memo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AnswerPayload } from '@/lib/domain/assessment';
import { useTelemetry } from '../hooks/useTelemetry';

interface LegoRankingProps {
    questionId: string;
    stem: string;
    items: Array<{ id: string; text: string }>;
    onAnswer: (payload: AnswerPayload) => void;
}

interface SortableItemProps {
    id: string;
    text: string;
    index: number;
}

/**
 * Sortable item component
 */
function SortableItem({ id, text, index }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        group relative bg-[#252525] border border-white/5 rounded-xl p-4 transition-all
        ${isDragging ? 'opacity-50 ring-2 ring-amber-500/30 shadow-2xl' : 'hover:border-white/10'}
      `}
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-amber-500 transition-colors"
                    aria-label="Arrastrar para reordenar"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="opacity-60"
                    >
                        <circle cx="7" cy="5" r="1.5" />
                        <circle cx="13" cy="5" r="1.5" />
                        <circle cx="7" cy="10" r="1.5" />
                        <circle cx="13" cy="10" r="1.5" />
                        <circle cx="7" cy="15" r="1.5" />
                        <circle cx="13" cy="15" r="1.5" />
                    </svg>
                </div>

                {/* Position Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-500">{index + 1}</span>
                </div>

                {/* Item Text */}
                <p className="flex-1 text-white font-medium">{text}</p>
            </div>
        </div>
    );
}

/**
 * Ranking Component (Drag & Drop Ordering)
 */
export const LegoRanking = memo(function LegoRanking({
    questionId,
    stem,
    items,
    onAnswer,
}: LegoRankingProps) {
    const [orderedItems, setOrderedItems] = useState(items);
    const { start, logInteraction, captureSnapshot } = useTelemetry();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize telemetry on mount
    useEffect(() => {
        start();
    }, [start]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setOrderedItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                // Log interaction for telemetry
                logInteraction('CHANGE');

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = () => {
        const telemetry = captureSnapshot();

        onAnswer({
            questionId,
            value: orderedItems.map((item) => item.id),
            isGap: false,
            telemetry,
        });
    };

    return (
        <div className="space-y-6">
            {/* Question Stem */}
            <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white leading-relaxed">
                    {stem}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                    Arrastra los elementos para ordenarlos correctamente
                </p>
            </div>

            {/* Sortable List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={orderedItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {orderedItems.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                index={index}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                aria-label="Confirmar orden"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                Confirmar Orden
            </button>
        </div>
    );
});
