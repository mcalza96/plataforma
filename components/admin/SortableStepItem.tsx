'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStepItemProps {
    id: string;
    title: string;
    index: number;
    onUpdateTitle: (id: string, title: string) => void;
    onRemove: (id: string) => void;
}

export function SortableStepItem({ id, title, index, onUpdateTitle, onRemove }: SortableStepItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center gap-4 p-4 bg-[#1F1F1F] border rounded-2xl transition-all duration-300 ${isDragging
                    ? 'border-amber-500 shadow-2xl scale-105 opacity-50'
                    : 'border-white/5 hover:border-white/10 shadow-sm'
                }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-amber-500 transition-colors"
                aria-label="Arrastrar paso"
            >
                <span className="material-symbols-outlined select-none">drag_indicator</span>
            </div>

            {/* Step Number */}
            <div className="size-8 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] font-black italic text-amber-500/50">
                {index + 1}
            </div>

            {/* Title Input */}
            <input
                value={title}
                onChange={(e) => onUpdateTitle(id, e.target.value)}
                className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:ring-0 outline-none placeholder:text-gray-700"
                placeholder="Describe este paso..."
            />

            {/* Actions */}
            <button
                onClick={() => onRemove(id)}
                className="opacity-0 group-hover:opacity-100 size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                title="Eliminar paso"
            >
                <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
        </div>
    );
}
