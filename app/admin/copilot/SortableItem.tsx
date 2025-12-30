'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, node, onDelete }: { id: string, node: any, onDelete: () => void }) {
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
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-[#252525] border border-white/5 p-6 rounded-2xl transition-all shadow-xl ${isDragging ? 'opacity-50 ring-2 ring-amber-500/20' : 'hover:border-white/10'}`}
        >
            <div className="flex items-center gap-6">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-700 hover:text-amber-500 transition-colors">
                    <span className="material-symbols-outlined">drag_indicator</span>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md uppercase">
                            {node.type || 'LEGO'}
                        </span>
                        <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                            {node.title_override || `Módulo: ${node.id.slice(0, 8)}`}
                        </h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">
                        {node.description_override || 'Sin descripción personalizada.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-white/0 hover:bg-white/5 text-gray-600 hover:text-white rounded-xl transition-all">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-10 h-10 flex items-center justify-center bg-white/0 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-xl transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
