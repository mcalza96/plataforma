'use client';

import React, { useState } from 'react';
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Ghost, Activity, Box, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningFrontierMiniMap } from './LearningFrontierMiniMap';
import { deployInstrument, getDeploymentImpact, type DeploymentImpact } from '@/lib/actions/admin/deployment-actions';

// --- Sub-components ---

interface DraggableProbeProps {
    id: string;
    title: string;
    description: string;
}

function DraggableProbe({ id, title, description }: DraggableProbeProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `probe-${id}`,
        data: { id, title, type: 'probe' }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "p-4 rounded-2xl bg-[#252525] border-2 border-white/5 cursor-grab active:cursor-grabbing hover:border-amber-500/40 transition-all group",
                isDragging && "opacity-50 ring-2 ring-amber-500/50"
            )}
        >
            <div className="flex items-center gap-3">
                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                    <Target size={20} />
                </div>
                <div className="min-w-0">
                    <h5 className="text-[11px] font-black text-white italic uppercase truncate">{title}</h5>
                    <p className="text-[9px] text-zinc-500 truncate">{description}</p>
                </div>
            </div>
        </div>
    );
}

interface DroppableTargetProps {
    id: string;
    name: string;
    type: 'cohort' | 'course';
    isOverlay?: boolean;
}

function DroppableTarget({ id, name, type, isOverlay }: DroppableTargetProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `${type}-${id}`,
        data: { id, name, type }
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden",
                isOver ? "bg-emerald-500/5 border-emerald-500/50 scale-[1.02]" : "bg-[#1A1A1A]/50 border-white/5 hover:border-white/10",
                isOverlay && "bg-[#1A1A1A] border-emerald-500/50"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center transition-colors",
                        isOver ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-500"
                    )}>
                        {type === 'cohort' ? <Users size={24} /> : <Box size={24} />}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">{name}</h4>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{type}</span>
                    </div>
                </div>
                <ChevronRight size={18} className="text-zinc-700" />
            </div>

            {/* Drop Zone Indicator */}
            <AnimatePresence>
                {isOver && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 pointer-events-none"
                    >
                        <div className="size-16 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest relative z-10">Desplegar Aquí</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Main Orchestrator ---

interface DeploymentOrchestratorProps {
    probes: any[];
    cohorts: any[];
}

export function DeploymentOrchestrator({ probes, cohorts }: DeploymentOrchestratorProps) {
    const [activeProbe, setActiveProbe] = useState<any>(null);
    const [impact, setImpact] = useState<DeploymentImpact | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveProbe(active.data.current);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveProbe(null);

        if (over) {
            const probeId = active.data.current?.id;
            const targetId = over.data.current?.id;
            const targetType = over.data.current?.type;

            if (probeId && targetId && targetType) {
                setIsDeploying(true);
                try {
                    const result = await deployInstrument(probeId, targetId, targetType);
                    if (result.success) {
                        alert(`Exito: Sonda desplegada a ${result.deployedCount} alumnos.`);
                    }
                } catch (error) {
                    console.error("Deployment failed:", error);
                } finally {
                    setIsDeploying(false);
                }
            }
        }
    };

    const handleOver = async (overId: string) => {
        if (!activeProbe) return;
        // Logic to fetch impact preview on hover (omitted for brevity in DnD performance)
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-12 gap-8 min-h-[600px]">
                {/* Panel Izquierdo: Hangar */}
                <div className="col-span-3 flex flex-col gap-6">
                    <div className="flex items-center gap-2 p-2">
                        <Rocket className="text-amber-500" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Hangar de Sondas</h3>
                    </div>
                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                        {probes.map(probe => (
                            <DraggableProbe
                                key={probe.id}
                                id={probe.id}
                                title={probe.title}
                                description={probe.description}
                            />
                        ))}
                    </div>
                </div>

                {/* Panel Central: Canvas de Despliegue */}
                <div className="col-span-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <Activity className="text-emerald-500" size={18} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Canvas de Despliegue</h3>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">ARRASTRA UNA SONDA HACIA UNA COHORTE</span>
                    </div>

                    <div className="space-y-4">
                        {cohorts.map(cohort => (
                            <DroppableTarget
                                key={cohort.id}
                                id={cohort.id}
                                name={cohort.name}
                                type="cohort"
                            />
                        ))}
                    </div>

                    {cohorts.length === 0 && (
                        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] flex items-center justify-center p-20 bg-white/[0.02]">
                            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">No hay cohortes activas para despliegue</p>
                        </div>
                    )}
                </div>

                {/* Panel Derecho: Insight Panel */}
                <div className="col-span-3 space-y-6">
                    <div className="flex items-center gap-2 p-2">
                        <Target className="text-blue-500" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Previsualizador de Impacto</h3>
                    </div>

                    <LearningFrontierMiniMap
                        nodes={[]} // Will be populated in a more advanced iteration
                    />

                    <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Densidad de Nodos Sombra</h5>
                            <span className="text-[10px] font-bold text-amber-500">42%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full w-[42%] bg-amber-500 rounded-full" />
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                            "Esta sonda audita 3 de los 7 malentendidos críticos identificados en esta cohorte."
                        </p>
                    </div>
                </div>
            </div>

            {/* Drag Overlay for smooth visuals */}
            <DragOverlay>
                {activeProbe ? (
                    <div className="p-4 rounded-2xl bg-[#252525] border-2 border-amber-500/50 shadow-2xl opacity-90 scale-105 pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-amber-500 text-black rounded-xl flex items-center justify-center">
                                <Target size={20} />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-black text-white uppercase italic truncate">{activeProbe.title}</h5>
                                <p className="text-[9px] text-amber-500/70 font-mono uppercase">Unidad activa para despliegue</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            {isDeploying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                        <div className="size-16 rounded-full border-4 border-t-emerald-500 border-white/5 animate-spin mx-auto" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] animate-pulse">Sincronizando Grafo...</h3>
                    </div>
                </div>
            )}
        </DndContext>
    );
}
