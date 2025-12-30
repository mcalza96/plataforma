'use client';

import LegoStack from '@/components/ui/LegoStack';
import confetti from 'canvas-confetti';
import { useRef } from 'react';

type StepType = 'video' | 'quiz' | 'resource' | 'practice';

interface Step {
    id: number;
    title: string;
    type: StepType;
    timestamp?: number; // In seconds
}

interface AtomicStepListProps {
    totalSteps: number;
    completedSteps: number;
    onToggleStep: (stepIndex: number) => void;
    onJumpToStep?: (timestamp: number) => void;
    onStartQuiz?: (stepIndex: number) => void;
    isPending: boolean;
}

/**
 * Component to display the list of atomic steps and progress.
 * Now supports Polymorphic Steps (Video, Quiz, Resource, Practice) and LegoStack.
 */
export default function AtomicStepList({
    totalSteps,
    completedSteps,
    onToggleStep,
    onJumpToStep,
    onStartQuiz,
    isPending
}: AtomicStepListProps) {
    const listRef = useRef<HTMLDivElement>(null);

    // Mock steps with polymorphic types
    const steps: Step[] = Array.from({ length: totalSteps }, (_, i) => {
        const types: StepType[] = ['video', 'practice', 'quiz', 'resource', 'practice'];
        return {
            id: i + 1,
            title: i === 2 ? 'Quiz: Composición Atómica' : i === 3 ? 'Recursos: Pinceles de Sombra' : `Paso ${i + 1}`,
            type: types[i % types.length],
            timestamp: i * 30,
        };
    });

    const isLessonComplete = completedSteps >= totalSteps;

    const handleToggle = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();

        const step = steps[index];
        if (step.type === 'quiz' && onStartQuiz) {
            onStartQuiz(index + 1);
            return;
        }

        const isCurrentlyCompleted = index < completedSteps;
        if (!isCurrentlyCompleted) {
            // Success Confetti 
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            confetti({
                particleCount: 40,
                spread: 70,
                origin: {
                    x: rect.left / window.innerWidth,
                    y: rect.top / window.innerHeight
                },
                colors: ['#0d93f2', '#a855f7', '#ffffff'],
                zIndex: 1000
            });
        }

        onToggleStep(index + 1);
    };

    const handleJump = (step: Step) => {
        if (step.type === 'quiz' && onStartQuiz) {
            onStartQuiz(step.id);
            return;
        }
        if (step.timestamp !== undefined && onJumpToStep) {
            onJumpToStep(step.timestamp);
        }
    };

    const getTypeConfig = (type: StepType) => {
        switch (type) {
            case 'video': return { icon: 'play_circle', color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' };
            case 'quiz': return { icon: 'bolt', color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' };
            case 'resource': return { icon: 'download', color: 'text-[#A855F7]', border: 'border-[#A855F7]/20', bg: 'bg-[#A855F7]/5' };
            case 'practice': return { icon: 'brush', color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' };
            default: return { icon: 'brush', color: 'text-gray-500', border: 'border-white/5', bg: 'bg-white/5' };
        }
    };

    return (
        <div className="flex-1 lg:basis-[30%] bg-[#1A1A1A] border-l border-white/5 flex flex-col min-w-[350px]">
            {/* List Header */}
            <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white leading-none">Pasos Atómicos</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Sincronización LEGO</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider transition-colors duration-500 ${isLessonComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                        {completedSteps} / {totalSteps}
                    </span>
                </div>
                <LegoStack completedSteps={completedSteps} totalSteps={totalSteps} variant="primary" />
            </div>

            {/* Scrollable List */}
            <div
                ref={listRef}
                className={`flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
            >
                {steps.map((step, index) => {
                    const isStepCompleted = index < completedSteps;
                    const isActive = index === completedSteps;
                    const config = getTypeConfig(step.type);

                    return (
                        <div
                            key={step.id}
                            onClick={() => handleJump(step)}
                            className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${isStepCompleted
                                ? 'bg-neutral-800/20 border-white/5 opacity-60 hover:opacity-100 hover:scale-[1.01] ring-2 ring-primary/0'
                                : isActive
                                    ? `bg-neutral-800 border-primary/50 shadow-[0_0_15px_rgba(13,147,242,0.15)] scale-[1.02]`
                                    : 'hover:bg-neutral-800/40 border-transparent hover:border-white/5'
                                } ${isStepCompleted ? 'animate-glow-ring' : ''}`}
                            style={{ minHeight: '72px' }}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse"></div>}

                            <div className="shrink-0 relative">
                                <div className={`rounded-xl h-14 w-14 flex items-center justify-center transition-all ${config.bg} ${config.border}`}>
                                    <span className={`material-symbols-outlined text-3xl font-light transition-colors ${isStepCompleted ? 'text-primary' : config.color}`}>{config.icon}</span>
                                </div>
                                {isStepCompleted && (
                                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 shadow-lg ring-2 ring-[#1A1A1A] animate-in zoom-in duration-300">
                                        <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-bold truncate transition-all duration-300 ${isStepCompleted ? 'text-white/40 line-through decoration-white/20' : 'text-white'}`}>
                                        {step.title}
                                    </p>
                                    {isActive && <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{step.type}</p>
                                    {step.timestamp !== undefined && step.type !== 'quiz' && (
                                        <span className="text-[9px] font-bold text-gray-500 flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                            {Math.floor(step.timestamp / 60)}:{(step.timestamp % 60).toString().padStart(2, '0')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div
                                className="shrink-0 pr-1"
                                onClick={(e) => handleToggle(e, index)}
                            >
                                <button className={`size-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${isStepCompleted ? 'border-primary bg-primary shadow-lg shadow-primary/20' : isActive ? 'border-primary/30 bg-primary/5' : 'border-neutral-800'}`}>
                                    {isStepCompleted ? (
                                        <span className="material-symbols-outlined text-white text-[20px] font-bold">check</span>
                                    ) : step.type === 'quiz' ? (
                                        <span className="material-symbols-outlined text-amber-500 text-[20px]">bolt</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-primary/0 group-hover:text-primary/50 text-[20px]">done</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thumb-neutral-700::-webkit-scrollbar-thumb { background: #404040; border-radius: 10px; }
                
                @keyframes glow-ring {
                    0% { ring-color: rgba(13, 147, 242, 0.5); }
                    50% { ring-color: rgba(13, 147, 242, 1); box-shadow: 0 0 10px rgba(13, 147, 242, 0.3); }
                    100% { ring-color: rgba(13, 147, 242, 0); }
                }
                .animate-glow-ring {
                    animation: glow-ring 1s ease-out;
                }
            `}</style>
        </div>
    );
}
