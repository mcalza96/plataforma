'use client';

import Link from 'next/link';
import { Lesson } from '@/lib/domain/course';

interface PhaseCardProps {
    lesson: Lesson;
    courseId: string;
}

/**
 * ISP: PhaseCard only handles displaying a summary of a mission phase (lesson)
 * and providing navigation to its own workshop/editor.
 */
export function PhaseCard({ lesson, courseId }: PhaseCardProps) {
    return (
        <div className="group bg-[#1F1F1F] border border-white/5 p-8 rounded-[2.5rem] hover:border-amber-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden active:scale-[0.99]">
            {/* Ambient background effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-amber-500/[0.05] transition-colors" />

            <div className="flex items-center gap-8 relative z-10 flex-1 w-full">
                {/* Order Indicator */}
                <div className="size-16 shrink-0 rounded-[1.5rem] bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-2xl italic text-amber-500 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {lesson.order}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.3em]">Fase de Aprendizaje</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-4 group-hover:text-amber-500 transition-colors">
                        {lesson.title || 'Fase sin título'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-[16px] text-gray-500">layers</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {lesson.total_steps || 0} Pasos Atómicos
                            </span>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${lesson.video_url
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            <span className="material-symbols-outlined text-[16px]">
                                {lesson.video_url ? 'check_circle' : 'pending'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {lesson.video_url ? 'Contenido Activo' : 'Pendiente Video'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
                <Link
                    href={`/admin/courses/${courseId}/phases/${lesson.id}`}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-amber-500 hover:text-black py-5 px-10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl group/btn active:scale-95 border border-white/5 hover:border-amber-500 hover:shadow-amber-500/20"
                >
                    ENTRAR AL TALLER
                    <span className="material-symbols-outlined !text-[18px] group-hover/btn:translate-x-2 transition-transform">construction</span>
                </Link>
            </div>
        </div>
    );
}
