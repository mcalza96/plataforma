'use client';

import { Lesson } from '@/lib/domain/course';

interface ContextPanelProps {
    formData: Lesson;
    allLessons: Lesson[];
    onUpdateField: (field: keyof Lesson, value: any) => void;
}

export default function ContextPanel({ formData, allLessons, onUpdateField }: ContextPanelProps) {
    return (
        <div className="space-y-8">
            {/* Metadata Section */}
            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Título de la Fase</label>
                    <input
                        value={formData.title}
                        onChange={(e) => onUpdateField('title', e.target.value)}
                        className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-xl font-black text-white focus:ring-2 ring-amber-500 transition-all outline-none"
                        placeholder="Ej: Bases del Dibujo Digital"
                    />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Orden Cronológico</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => onUpdateField('order', parseInt(e.target.value))}
                            className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white font-black text-center focus:ring-2 ring-amber-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Prerrequisito (DAG)</label>
                        <select
                            value={formData.parent_node_id ?? ''}
                            onChange={(e) => onUpdateField('parent_node_id', e.target.value || null)}
                            className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white font-black text-sm focus:ring-2 ring-amber-500 appearance-none outline-none"
                        >
                            <option value="">Fase Inicial (Raíz)</option>
                            {allLessons
                                .filter(l => l.id !== formData.id)
                                .map(l => (
                                    <option key={l.id} value={l.id}>Fase {l.order}: {l.title}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Briefing de Fase</label>
                    <textarea
                        value={formData.description ?? ''}
                        onChange={(e) => onUpdateField('description', e.target.value)}
                        className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white text-sm focus:ring-2 ring-amber-500 outline-none transition-all min-h-[160px] leading-relaxed font-medium"
                        placeholder="Define los objetivos técnicos de este escalón..."
                    />
                </div>
            </div>

            {/* Video Content Section */}
            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-10 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-amber-500">play_circle</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Master Class URL</h3>
                </div>
                <input
                    value={formData.video_url}
                    onChange={(e) => onUpdateField('video_url', e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white font-mono text-xs focus:ring-2 ring-amber-500 outline-none"
                    placeholder="https://video-source.com/..."
                />
            </div>
        </div>
    );
}
