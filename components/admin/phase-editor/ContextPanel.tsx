'use client';

import { Lesson } from '@/lib/domain/course';
import ResourceUploader from '@/components/admin/ResourceUploader';

interface ContextPanelProps {
    lesson: Lesson;
    onUpdateField: (field: keyof Lesson, value: any) => void;
    errors?: string[];
}

/**
 * ISP: ContextPanel focuses only on high-level phase metadata and video control.
 */
export function ContextPanel({ lesson, onUpdateField, errors }: ContextPanelProps) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
            {/* Video Preview / Placeholder */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] ml-2">Master Video (URL)</label>
                <div className="aspect-video bg-black rounded-3xl border border-white/5 flex flex-col items-center justify-center group overflow-hidden relative shadow-2xl">
                    {lesson.video_url ? (
                        <div className="w-full h-full bg-neutral-900 border-none">
                            {/* Simple Preview - In production we'd use a real player */}
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <span className="material-symbols-outlined text-4xl text-amber-500">play_circle</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Video Enlazado</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-700">
                            <span className="material-symbols-outlined text-5xl">videocam_off</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sin señal de video</span>
                        </div>
                    )}
                </div>
                <input
                    value={lesson.video_url}
                    onChange={(e) => onUpdateField('video_url', e.target.value)}
                    className={`w-full bg-black/20 border rounded-2xl p-4 text-xs text-white placeholder:text-gray-800 focus:ring-1 ring-amber-500 outline-none transition-all shadow-inner ${errors?.some(e => e.includes('video')) ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/5'}`}
                    placeholder="URL de Loom o MP4..."
                />
                {errors?.filter(e => e.includes('video')).map((err, i) => (
                    <p key={i} className="text-[10px] text-red-400 font-bold ml-2 italic">{err}</p>
                ))}
            </div>

            {/* Metadata Section */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Título de la Fase</label>
                    <input
                        value={lesson.title}
                        onChange={(e) => onUpdateField('title', e.target.value)}
                        className={`w-full bg-black/20 border rounded-2xl p-5 text-lg font-black text-white focus:ring-1 ring-amber-500 outline-none transition-all shadow-inner ${errors?.some(e => e.includes('título')) ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/5'}`}
                    />
                    {errors?.filter(e => e.includes('título')).map((err, i) => (
                        <p key={i} className="text-[10px] text-red-400 font-bold ml-2 italic">{err}</p>
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Identificador Visual</label>
                    <ResourceUploader
                        folder="lesson-thumbnails"
                        accept="image/*"
                        initialUrl={lesson.thumbnail_url ?? undefined}
                        label="Cambiar Miniatura"
                        onUploadComplete={(url) => onUpdateField('thumbnail_url', url)}
                    />
                </div>
            </div>

            {/* Hint Box */}
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-2">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Consejo de Instructor</h4>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                    "Mantén los vídeos maestros por debajo de los 15 minutos para maximizar la retención cognitiva del alumno."
                </p>
            </div>
        </div>
    );
}
