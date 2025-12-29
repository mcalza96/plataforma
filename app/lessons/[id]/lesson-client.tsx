'use client';

import { useState, useTransition } from 'react';
import { toggleStepCompletion } from '@/lib/lesson-actions';
import { Lesson, LearnerProgress } from '@/lib/courses';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LessonClientProps {
    courseId: string;
    learnerId: string;
    lesson: Lesson;
    initialProgress?: LearnerProgress;
    nextLessonId?: string;
}

export default function LessonClient({ courseId, learnerId, lesson, initialProgress, nextLessonId }: LessonClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [completedSteps, setCompletedSteps] = useState(initialProgress?.completed_steps || 0);
    const [showCelebration, setShowCelebration] = useState(false);

    const isLessonComplete = completedSteps >= lesson.total_steps;

    const steps = Array.from({ length: lesson.total_steps }, (_, i) => ({
        id: i + 1,
        title: `Paso ${i + 1}`, // Generic title as schema doesn't have per-step titles yet
        description: 'Sigue las instrucciones del video para completar este paso.',
    }));

    const handleStepToggle = (stepIndex: number) => {
        const isCurrentlyCompleted = stepIndex <= completedSteps;
        let newCount = completedSteps;

        if (isCurrentlyCompleted) {
            // If they click a step that is already completed, we toggle back to the previous step
            newCount = stepIndex - 1;
        } else {
            // If they click a future step, we jump to it
            newCount = stepIndex;
        }

        setCompletedSteps(newCount);

        // Check if just completed the whole lesson
        if (newCount >= lesson.total_steps && !isLessonComplete) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
        }

        startTransition(async () => {
            await toggleStepCompletion(learnerId, lesson.id, newCount, lesson.total_steps, courseId);
        });
    };

    const handleNextLesson = () => {
        if (nextLessonId) {
            router.push(`/lessons/${courseId}?lessonId=${nextLessonId}`);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#1A1A1A]">
            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-none">
                    <div className="text-center animate-bounce">
                        <span className="material-symbols-outlined text-9xl text-white drop-shadow-[0_0_30px_rgba(13,147,242,0.8)]">emoji_events</span>
                        <h2 className="text-4xl font-black text-white mt-4 uppercase tracking-tighter">¡Misión Cumplida!</h2>
                    </div>
                </div>
            )}

            {/* Left Column: Video Player Area (70%) */}
            <div className="flex-1 lg:basis-[70%] flex flex-col bg-black relative group/player">
                <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                    {/* Native Video Player as per .cursorrules */}
                    <video
                        key={lesson.id} // Force re-render when lesson changes
                        className="w-full h-full object-contain"
                        controls
                        poster={lesson.thumbnail_url || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"}
                        src={lesson.video_url}
                    >
                        Tu navegador no soporta el video.
                    </video>

                    {/* Top Left Lesson Title Overlay (Visual only, controls override) */}
                    <div className="absolute top-0 left-0 p-8 w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                            {lesson.title}
                        </h1>
                        <p className="text-gray-300 mt-1 text-base lg:text-lg">
                            {lesson.description || 'Aprendiendo nuevas técnicas digitales.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Atomic Steps & Actions (30%) */}
            <div className="flex-1 lg:basis-[30%] bg-[#1A1A1A] border-l border-white/5 flex flex-col min-w-[350px]">
                {/* List Header */}
                <div className="p-6 pb-2 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">Pasos Atómicos</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider transition-colors duration-500 ${isLessonComplete ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                            }`}>
                            {completedSteps} de {lesson.total_steps} Completados
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">Sigue los pasos para completar tu obra maestra.</p>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                    {steps.map((step, index) => {
                        const isCompleted = index < completedSteps;
                        const isActive = index === completedSteps;

                        return (
                            <div
                                key={step.id}
                                onClick={() => handleStepToggle(index + 1)}
                                className={`group flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer 44px-touch ${isCompleted
                                    ? 'bg-neutral-800/20 border-white/5 opacity-60 hover:opacity-100 hover:scale-[1.02]'
                                    : isActive
                                        ? 'bg-neutral-800 border-primary/50 shadow-[0_0_15px_rgba(13,147,242,0.15)] relative overflow-hidden scale-[1.02]'
                                        : 'hover:bg-neutral-800/40 border-transparent hover:border-white/5 hover:scale-[1.01]'
                                    }`}
                                style={{ minHeight: '64px' }}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse"></div>}

                                <div className="shrink-0 relative">
                                    <div className="bg-neutral-700 rounded-lg h-14 w-14 flex items-center justify-center">
                                        <span className={`material-symbols-outlined text-3xl font-light transition-colors ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>brush</span>
                                    </div>
                                    {isCompleted && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg animate-in fade-in zoom-in duration-300">
                                            <div className="bg-primary rounded-full p-1 shadow-lg shadow-primary/50">
                                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <p className={`text-base font-medium transition-all duration-300 ${isCompleted ? 'text-white/40 line-through decoration-white/20' : 'text-white'
                                        } ${isActive ? 'text-primary font-bold' : ''}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-gray-500 text-xs uppercase tracking-tighter">Paso Atómico {step.id}</p>
                                </div>
                                <div className="shrink-0 pr-2">
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isCompleted ? 'border-primary bg-primary scale-110 shadow-[0_0_10px_rgba(13,147,242,0.5)]' : isActive ? 'border-primary/50' : 'border-neutral-700'
                                        }`}>
                                        {isCompleted && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Actions Sticky Footer */}
                <div className="p-6 bg-[#1A1A1A] border-t border-white/5 space-y-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    {isLessonComplete ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleNextLesson}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(34,197,94,0.4)] animate-in slide-in-from-bottom-2"
                            >
                                <span className="material-symbols-outlined font-bold">celebration</span>
                                <span className="text-lg uppercase">¡Misión Cumplida! {nextLessonId ? 'Siguiente Lección' : 'Volver a Base'}</span>
                            </button>
                            <Link
                                href="/gallery"
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-all duration-300 active:scale-95"
                            >
                                <span className="material-symbols-outlined leading-none">cloud_upload</span>
                                <span className="text-sm uppercase">Subir Obra a Mi Galería</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {lesson.download_url && (
                                <a
                                    href={lesson.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_14px_rgba(13,147,242,0.4)] active:scale-95"
                                >
                                    <span className="material-symbols-outlined leading-none">download</span>
                                    <span className="text-lg">Descargar Pinceles</span>
                                </a>
                            )}
                            <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider">
                                <span className="material-symbols-outlined leading-none">visibility</span>
                                <span>Ver Objetivo Final</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .44px-touch {
                    min-height: 44px;
                }
            `}</style>
        </main>
    );
}
