'use client';

import { useState, useOptimistic } from 'react';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { PathNode } from '@/lib/domain/course';

export default function CopilotLaboratory({ initialNodes }: { initialNodes: any[] }) {
    const [nodes, setNodes] = useState(initialNodes);

    // Optimismo para el reordenamiento
    const [optimisticNodes, addOptimisticNode] = useOptimistic(
        nodes,
        (state, newOrder: any[]) => newOrder
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setNodes((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);

                const newArray = arrayMove(items, oldIndex, newIndex);
                // Aquí podrías disparar el re-order en el servidor silenciosamente
                return newArray;
            });
        }
    };

    const removeNode = (id: string) => {
        setNodes(nodes.filter(n => n.id !== id));
    };

    return (
        <div className="grid lg:grid-cols-3 gap-12">
            {/* Lienzo de Edición (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-white">Lienzo de Arquitectura</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ajusta la secuencia LEGO sugerida</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all text-xs font-black">
                        <span className="material-symbols-outlined text-sm">save</span>
                        Activar Camino
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={nodes.map(n => n.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {nodes.map((node) => (
                                <SortableItem
                                    key={node.id}
                                    id={node.id}
                                    node={node}
                                    onDelete={() => removeNode(node.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Caja de LEGOs (1/3) */}
            <div className="space-y-6">
                <div className="bg-[#252525] border border-white/5 rounded-3xl p-6 h-fit sticky top-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-xl">
                            <span className="material-symbols-outlined text-amber-500">category</span>
                        </div>
                        <h4 className="font-black text-white italic">Caja de Ladrillos</h4>
                    </div>
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar en la biblioteca..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs text-white outline-none focus:ring-1 ring-amber-500/50"
                        />
                    </div>
                    <p className="text-[9px] text-gray-600 font-black uppercase text-center py-10 border-2 border-dashed border-white/5 rounded-2xl italic">
                        Arrastra un ALO aquí para inyectarlo en la ruta
                    </p>
                </div>
            </div>
        </div>
    );
}
