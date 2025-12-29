'use client';

import { useState, useTransition } from 'react';
import { toggleStepCompletion } from '@/lib/lesson-actions';
import { Lesson, LearnerProgress } from '@/lib/courses';

interface LessonClientProps {
    courseId: string;
    learnerId: string;
    lesson: Lesson;
    initialProgress?: LearnerProgress;
}

export default function LessonClient({ courseId, learnerId, lesson, initialProgress }: LessonClientProps) {
    const [isPending, startTransition] = useTransition();
    const [completedSteps, setCompletedSteps] = useState(initialProgress?.completed_steps || 0);

    const steps = Array.from({ length: lesson.total_steps }, (_, i) => ({
        id: i + 1,
        title: `Paso ${i + 1}`, // Generic title as schema doesn't have per-step titles yet
        description: 'Sigue las instrucciones del video para completar este paso.',
    }));

    const handleStepToggle = (stepIndex: number) => {
        // Toggle logic: If user clicks step 3, they complete up to step 3.
        // If they click the current max completed step, they probably want to undo it.
        const newCount = stepIndex === completedSteps ? stepIndex - 1 : stepIndex;

        setCompletedSteps(newCount);

        startTransition(async () => {
            await toggleStepCompletion(learnerId, lesson.id, newCount, lesson.total_steps, courseId);
        });
    };

    return (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#1A1A1A]">
            {/* Left Column: Video Player Area (70%) */}
            <div className="flex-1 lg:basis-[70%] flex flex-col bg-black relative group/player">
                <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                    {/* Native Video Player as per .cursorrules */}
                    <video
                        className="w-full h-full object-contain"
                        controls
                        poster={`https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop`}
                        src={lesson.video_url}
                    >
                        Tu navegador no soporta el video.
                    </video>

                    {/* Top Left Lesson Title Overlay (Visual only, controls override) */}
                    <div className="absolute top-0 left-0 p-8 w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-md">
                            {lesson.title}
                        </h1>
                        <p className="text-gray-300 mt-2 text-lg">Aprendiendo nuevas técnicas digitales.</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Atomic Steps & Actions (30%) */}
            <div className="flex-1 lg:basis-[30%] bg-[#1A1A1A] border-l border-white/5 flex flex-col min-w-[350px]">
                {/* List Header */}
                <div className="p-6 pb-2 border-b border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">Pasos Atómicos</h3>
                        <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded uppercase tracking-wider">
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
                                className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${isCompleted
                                    ? 'bg-neutral-800/40 border-white/5 opacity-70 hover:opacity-100'
                                    : isActive
                                        ? 'bg-neutral-800 border-primary/50 shadow-[0_0_15px_rgba(13,147,242,0.15)] relative overflow-hidden'
                                        : 'hover:bg-neutral-800/50 border-transparent hover:border-white/5'
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}

                                <div className="shrink-0 relative">
                                    <div className="bg-neutral-700 rounded-lg h-16 w-16 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-500 text-3xl font-light">brush</span>
                                    </div>
                                    {isCompleted && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                                            <div className="bg-primary rounded-full p-1 shadow-lg">
                                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <p className={`text-base font-medium ${isCompleted ? 'text-white/50 line-through decoration-white/30' : 'text-white'
                                        } ${isActive ? 'text-primary font-bold' : ''}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-gray-500 text-sm">Paso Atómico {step.id}</p>
                                </div>
                                <div className="shrink-0 pr-2">
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'border-primary bg-primary' : isActive ? 'border-primary/50' : 'border-neutral-600'
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
                    <button className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_14px_rgba(13,147,242,0.4)] active:scale-95 disabled:opacity-50" disabled={isPending}>
                        <span className="material-symbols-outlined leading-none">download</span>
                        <span className="text-lg">Descargar Pinceles</span>
                    </button>
                    <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-all duration-300 active:scale-95">
                        <span className="material-symbols-outlined leading-none">visibility</span>
                        <span>Ver Objetivo Final</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
