'use client';

import React, { useRef, useEffect } from 'react';
import { Lesson } from '@/lib/domain/course';
import ResourceUploader from '@/components/admin/ResourceUploader';

interface PhaseMetadataProps {
    lesson: Lesson;
    onUpdateField: (field: keyof Lesson, value: any) => void;
    errors?: string[];
}

/**
 * PhaseMetadata: Cinematic editorial header.
 * Handles Video Hero, Inline Title, and Briefing/Description.
 */
export function PhaseMetadata({ lesson, onUpdateField, errors }: PhaseMetadataProps) {
    const titleRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea for title
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [lesson.title]);

    const hasVideo = !!lesson.video_url;

    return (
        <section className="space-y-12 animate-in fade-in duration-1000">
            {/* Video Hero */}
            <div className="relative group">
                <div className={`aspect-video w-full rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 ${!hasVideo ? 'hover:border-amber-500/20' : ''}`}>
                    {hasVideo ? (
                        <div className="w-full h-full relative group/player">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            {/* In a real scenario, we'd use a video player component here */}
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]">
                                <span className="material-symbols-outlined text-6xl text-amber-500/80 group-hover/player:scale-110 transition-transform duration-500">play_circle</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Master Video Activo</p>
                            </div>

                            {/* Overlay URL change */}
                            <div className="absolute bottom-8 left-8 right-8 z-20 opacity-0 group-hover/player:opacity-100 transition-opacity duration-500">
                                <input
                                    value={lesson.video_url || ''}
                                    onChange={(e) => onUpdateField('video_url', e.target.value)}
                                    className="w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-[11px] text-white/70 outline-none focus:border-amber-500/50 transition-all"
                                    placeholder="Cambiar URL de Loom o MP4..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-4xl text-white/20">videocam</span>
                            </div>
                            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Sin señal de video</h3>
                            <div className="max-w-xs">
                                <input
                                    onChange={(e) => onUpdateField('video_url', e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] text-white placeholder:text-white/20 focus:border-amber-500/30 outline-none text-center transition-all"
                                    placeholder="Pega la URL del video aquí..."
                                />
                            </div>
                        </div>
                    )}
                </div>
                {errors?.some(e => e.includes('video')) && (
                    <p className="absolute -bottom-6 left-6 text-[10px] text-red-400 font-bold italic">
                        {errors.find(e => e.includes('video'))}
                    </p>
                )}
            </div>

            {/* Editorial Metadata */}
            <div className="space-y-4 max-w-4xl">
                <div className="group">
                    <textarea
                        ref={titleRef}
                        value={lesson.title}
                        onChange={(e) => onUpdateField('title', e.target.value)}
                        placeholder="Sin Título"
                        rows={1}
                        className="w-full bg-transparent border-none text-5xl lg:text-6xl font-black text-white placeholder:text-white/10 focus:ring-0 outline-none resize-none transition-all duration-300 leading-[1.1] tracking-tighter"
                    />
                </div>

                <div className="flex items-center gap-6 pt-2">
                    <div className="h-0.5 w-12 bg-amber-500/50 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/50">Briefing de la Fase</span>
                </div>

                <textarea
                    value={lesson.description || ''}
                    onChange={(e) => onUpdateField('description', e.target.value)}
                    placeholder="Describe el objetivo de esta fase y lo que el alumno logrará..."
                    className="w-full bg-transparent border-none text-xl text-gray-400 placeholder:text-gray-800 focus:ring-0 outline-none resize-none min-h-[100px] leading-relaxed font-medium transition-colors focus:text-gray-300"
                />
            </div>

            {/* Connection Line to Timeline */}
            <div className="w-[1px] h-20 bg-gradient-to-b from-white/10 to-transparent ml-6 mt-12" />
        </section>
    );
}
