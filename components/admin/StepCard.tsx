'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

export type StepType = 'video' | 'quiz' | 'resource' | 'practice';

export interface StepData {
    id: string;
    title: string;
    description: string;
    type: StepType;
    duration: number; // in minutes
}

interface StepCardProps {
    step: StepData;
    index: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpdate: (id: string, updates: Partial<StepData>) => void;
    onRemove: (id: string) => void;
}

const TYPE_CONFIG = {
    video: { icon: 'play_circle', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    quiz: { icon: 'quiz', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    resource: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    practice: { icon: 'edit_square', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

export default function StepCard({
    step,
    index,
    isExpanded,
    onToggleExpand,
    onUpdate,
    onRemove
}: StepCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const config = TYPE_CONFIG[step.type] || TYPE_CONFIG.video;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex flex-col overflow-hidden transition-all duration-300 ${isDragging
                ? 'scale-105 shadow-2xl z-50 opacity-100'
                : 'opacity-100'
                }`}
        >
            {/* Lego Brick Header (Collapsed State) */}
            <div
                className={`relative flex items-center gap-4 p-4 transition-all duration-300 ${isExpanded
                    ? 'bg-[#252525] border-t border-x border-white/10 rounded-t-2xl shadow-xl'
                    : 'bg-[#1F1F1F] border border-white/5 rounded-2xl hover:border-amber-500/30'
                    } ${isDragging ? 'border-amber-500 bg-[#252525]' : ''}`}
            >
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move p-1 text-gray-700 hover:text-amber-500 transition-colors"
                >
                    <span className="material-symbols-outlined select-none text-[20px]">drag_indicator</span>
                </div>

                {/* Type Icon */}
                <div className={`size-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} shadow-inner`}>
                    <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0" onClick={onToggleExpand}>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 italic">#{index + 1}</span>
                        <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight">
                            {step.title || 'Sin título'}
                        </h4>
                    </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg">
                        <span className="material-symbols-outlined text-[14px] text-gray-500">schedule</span>
                        <span className="text-[10px] font-black text-gray-400">{step.duration}m</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(step.id);
                            }}
                            className="size-8 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <button
                            onClick={onToggleExpand}
                            className={`size-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all ${isExpanded ? 'rotate-180 text-amber-500' : 'text-gray-600'}`}
                        >
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart Content Panel (Expanded State) */}
            <AnimatePresence>
                {isExpanded && !isDragging && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-[#1A1A1A] border-x border-b border-white/10 rounded-b-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Main Inputs */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Título del Paso</label>
                                        <input
                                            value={step.title}
                                            onChange={(e) => onUpdate(step.id, { title: e.target.value })}
                                            className="w-full bg-[#252525] border border-white/5 rounded-xl p-4 text-sm text-white focus:ring-1 ring-amber-500 outline-none"
                                            placeholder="Ej: Introducción a Procreate..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Descripción Atómica</label>
                                        <textarea
                                            value={step.description}
                                            onChange={(e) => onUpdate(step.id, { description: e.target.value })}
                                            className="w-full bg-[#252525] border border-white/5 rounded-xl p-4 text-xs text-white focus:ring-1 ring-amber-500 outline-none min-h-[100px] resize-none"
                                            placeholder="¿Qué aprenderá el alumno en este bloque?"
                                        />
                                    </div>
                                </div>

                                {/* Config Inputs */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Estrategia</label>
                                            <select
                                                value={step.type}
                                                onChange={(e) => onUpdate(step.id, { type: e.target.value as StepType })}
                                                className="w-full bg-[#252525] border border-white/5 rounded-xl p-4 text-xs text-white focus:ring-1 ring-amber-500 outline-none appearance-none font-bold"
                                            >
                                                <option value="video">Vídeo Master</option>
                                                <option value="quiz">Control LEGO</option>
                                                <option value="resource">Recurso PDF</option>
                                                <option value="practice">Práctica Libre</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Duración (m)</label>
                                            <input
                                                type="number"
                                                value={step.duration}
                                                onChange={(e) => onUpdate(step.id, { duration: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-[#252525] border border-white/5 rounded-xl p-4 text-xs text-white font-bold text-center focus:ring-1 ring-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mt-4">
                                        <p className="text-[9px] text-amber-500/60 font-medium italic leading-relaxed">
                                            Configurando como <strong>{step.type.toUpperCase()}</strong>. Asegúrate de que los metadatos ayuden al alumno a progresar en su mapa de misión.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
