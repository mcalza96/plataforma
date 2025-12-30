'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StepContentVideo,
    StepContentQuiz,
    StepContentResource,
    StepContentPractice
} from './step-types/ContentRenderers';

export type StepType = 'video' | 'quiz' | 'resource' | 'practice';

export interface StepData {
    id: string;
    title: string;
    description: string;
    type: StepType;
    duration: number; // in minutes
}

/**
 * ISP: Clean interface for StepCard.
 */
interface StepCardProps {
    step: StepData;
    index: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpdate: (id: string, updates: Partial<StepData>) => void;
    onRemove: (id: string) => void;
    errors?: string[];
}

const TYPE_CONFIG = {
    video: { icon: 'play_circle', color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', renderer: StepContentVideo },
    quiz: { icon: 'quiz', color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', renderer: StepContentQuiz },
    resource: { icon: 'description', color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/10', renderer: StepContentResource },
    practice: { icon: 'edit_square', color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/10', renderer: StepContentPractice },
};

export default function StepCard({
    step,
    index,
    isExpanded,
    onToggleExpand,
    onUpdate,
    onRemove,
    errors
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
    const Renderer = config.renderer;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex flex-col overflow-hidden transition-all duration-300 ${isDragging
                ? 'scale-[1.02] shadow-2xl z-50 opacity-100'
                : 'opacity-100'
                }`}
        >
            {/* Lego Brick Header (Collapsed State) */}
            <div
                className={`relative flex items-center gap-4 p-5 transition-all duration-300 ${isExpanded
                    ? 'bg-[#222222] border-t border-x border-white/10 rounded-t-3xl shadow-xl'
                    : 'bg-[#1A1A1A] border border-white/5 rounded-2xl hover:border-white/10'
                    } ${isDragging ? '!border-amber-500/50 bg-[#252525] scale-[1.02]' : ''}`}
            >
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move p-2 text-gray-700 hover:text-white transition-colors flex items-center justify-center bg-white/5 rounded-xl border border-white/5 active:scale-95"
                >
                    <span className="material-symbols-outlined select-none text-[18px]">drag_indicator</span>
                </div>

                {/* Type Icon Indicator */}
                <div className={`size-12 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center ${config.color} shadow-inner`}>
                    <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={onToggleExpand}>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-700 italic bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 tracking-tighter">#{index + 1}</span>
                        <h4 className="text-xs font-black text-white truncate uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                            {step.title || 'Módulo Atómico'}
                        </h4>
                    </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-5">
                    {errors && errors.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">{errors.length}</span>
                        </div>
                    )}

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/20 border border-white/5 rounded-xl">
                        <span className="material-symbols-outlined text-[14px] text-gray-600">schedule</span>
                        <span className="text-[9px] font-black text-gray-500 tracking-widest">{step.duration}MIN</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('¿Seguro que quieres eliminar este ladrillo del mapa?')) onRemove(step.id);
                            }}
                            className="size-10 rounded-xl text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center font-black"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <button
                            onClick={onToggleExpand}
                            className={`size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all ${isExpanded ? 'rotate-180 text-amber-500 border-amber-500/20' : 'text-gray-500'}`}
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
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-[#181818] border-x border-b border-white/10 rounded-b-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Main Form Column */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Título de la Unidad</label>
                                        <input
                                            value={step.title}
                                            onChange={(e) => onUpdate(step.id, { title: e.target.value })}
                                            className={`w-full bg-black/20 border rounded-2xl p-4 text-sm font-bold text-white focus:ring-1 ring-amber-500 outline-none transition-all placeholder:text-gray-800 ${errors?.some(e => e.includes('título')) ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/5'}`}
                                            placeholder="Introduce el nombre táctico..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Objetivo Cognitivo</label>
                                        <textarea
                                            value={step.description}
                                            onChange={(e) => onUpdate(step.id, { description: e.target.value })}
                                            className={`w-full bg-black/20 border rounded-2xl p-4 text-xs text-gray-300 focus:ring-1 ring-amber-500 outline-none min-h-[120px] resize-none leading-relaxed transition-all scrollbar-hide ${errors?.some(e => e.includes('Instrucciones') || e.includes('pregunta')) ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/5'}`}
                                            placeholder="Detalla lo que el alumno dominará al finalizar este bloque..."
                                        />
                                    </div>
                                    {errors && errors.length > 0 && (
                                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-1">
                                            {errors.map((err, i) => (
                                                <p key={i} className="text-[10px] text-red-400 font-bold flex items-center gap-2">
                                                    <span className="size-1 bg-red-500 rounded-full" />
                                                    {err}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Config Column */}
                                <div className="lg:col-span-5 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Estrategia</label>
                                            <div className="relative">
                                                <select
                                                    value={step.type}
                                                    onChange={(e) => onUpdate(step.id, { type: e.target.value as StepType })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-[10px] text-white font-black uppercase tracking-widest focus:ring-1 ring-white/10 outline-none appearance-none transition-all cursor-pointer"
                                                >
                                                    <option value="video">Vídeo Master</option>
                                                    <option value="quiz">Control LEGO</option>
                                                    <option value="resource">Recurso Atómico</option>
                                                    <option value="practice">Práctica Libre</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-sm">unfold_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Estimado (M)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={step.duration}
                                                    onChange={(e) => onUpdate(step.id, { duration: parseInt(e.target.value) || 0 })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs text-white font-black text-center focus:ring-1 ring-white/10 outline-none transition-all"
                                                />
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-sm">schedule</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Polymorphic Content Area (OCP) */}
                                    <div className="pt-2">
                                        <Renderer
                                            step={step}
                                            onUpdate={(updates) => onUpdate(step.id, updates)}
                                        />
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
