'use client';

import { useState, useEffect } from 'react';
import ResourceUploader from '@/components/admin/ResourceUploader';
import StepEditor from '@/components/admin/StepEditor';

interface LessonPanelProps {
    lesson: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: (lessonData: any) => Promise<void>;
    isSaving: boolean;
}

export default function LessonPanel({ lesson, isOpen, onClose, onSave, isSaving }: LessonPanelProps) {
    const [formData, setFormData] = useState<any>(lesson || {});

    useEffect(() => {
        if (lesson) {
            setFormData(lesson);
        } else {
            setFormData({ order: 1, total_steps: 5 });
        }
    }, [lesson, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-xl bg-[#1A1A1A] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] h-full flex flex-col animate-in slide-in-from-right duration-500">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#252525]/50 backdrop-blur-md">
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Editor de Lección</p>
                        <h3 className="text-2xl font-black tracking-tighter">
                            {lesson?.id ? 'Refinar Fase' : 'Nueva Fase de Misión'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 pb-40">
                    <div className="space-y-8">
                        {/* Título de la Lección */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Título de la Fase</label>
                            <input
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500 transition-all outline-none"
                                placeholder="Ej: Dominando las Capas"
                            />
                        </div>

                        {/* Video URL */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">URL del Video (MP4 / Loom)</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-amber-500 transition-colors">play_circle</span>
                                <input
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    required
                                    className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 pl-14 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500 transition-all outline-none font-mono text-xs"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        {/* Order Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Orden de ejecución</label>
                                <input
                                    type="number"
                                    value={formData.order || 1}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white focus:ring-2 ring-amber-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* LEGO Step Editor */}
                        <StepEditor
                            value={formData.total_steps || 5}
                            onChange={(val) => setFormData({ ...formData, total_steps: val })}
                        />

                        {/* Resource Uploader Integration */}
                        <ResourceUploader
                            label="Pinceles o Guías (Archivo .brushset / .pdf)"
                            folder="course-resources"
                            accept=".brushset,.pdf,.zip,.procreate"
                            initialUrl={formData.download_url}
                            onUploadComplete={(url) => setFormData({ ...formData, download_url: url })}
                        />

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Minitura de Lección (Opcional)</label>
                            <ResourceUploader
                                label=""
                                folder="lesson-thumbs"
                                accept="image/*"
                                initialUrl={formData.thumbnail_url}
                                onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Instrucciones de la Fase</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500 transition-all min-h-[120px] outline-none"
                                placeholder="Escribe aquí lo que el alumno debe aprender en esta fase..."
                            />
                        </div>
                    </div>
                </form>

                {/* Footer / Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A] to-transparent pointer-events-none">
                    <button
                        type="submit"
                        disabled={isSaving}
                        onClick={handleSubmit}
                        className="w-full pointer-events-auto bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-5 rounded-[2.5rem] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        {isSaving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                <span>SINCRONIZANDO CON EL ESTUDIO...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-black group-hover:translate-y-[-2px] transition-transform">auto_awesome</span>
                                <span>GUARDAR CAMBIOS EN LA FASE</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
