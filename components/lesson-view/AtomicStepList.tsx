'use client';

import LegoProgressBar from '@/components/dashboard/LegoProgressBar';

interface AtomicStepListProps {
    totalSteps: number;
    completedSteps: number;
    onToggleStep: (stepIndex: number) => void;
    isPending: boolean;
}

/**
 * Component to display the list of atomic steps and progress.
 */
export default function AtomicStepList({
    totalSteps,
    completedSteps,
    onToggleStep,
    isPending
}: AtomicStepListProps) {
    const steps = Array.from({ length: totalSteps }, (_, i) => ({
        id: i + 1,
        title: `Paso ${i + 1}`,
    }));

    const isLessonComplete = completedSteps >= totalSteps;

    return (
        <div className="flex-1 lg:basis-[30%] bg-[#1A1A1A] border-l border-white/5 flex flex-col min-w-[350px]">
            {/* List Header */}
            <div className="p-6 pb-2 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">Pasos Atómicos</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider transition-colors duration-500 ${isLessonComplete ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                        {completedSteps} de {totalSteps} Completados
                    </span>
                </div>
                <div className="mb-4">
                    <LegoProgressBar completedSteps={completedSteps} totalSteps={totalSteps} />
                </div>
                <p className="text-sm text-gray-400">Sigue los pasos para completar tu obra maestra.</p>
            </div>

            {/* Scrollable List */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
                {steps.map((step, index) => {
                    const isStepCompleted = index < completedSteps;
                    const isActive = index === completedSteps;

                    return (
                        <div
                            key={step.id}
                            onClick={() => onToggleStep(index + 1)}
                            className={`group flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${isStepCompleted
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
                                    <span className={`material-symbols-outlined text-3xl font-light transition-colors ${isStepCompleted ? 'text-primary' : 'text-gray-500'}`}>brush</span>
                                </div>
                                {isStepCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg animate-in fade-in zoom-in duration-300">
                                        <div className="bg-primary rounded-full p-1 shadow-lg shadow-primary/50">
                                            <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1">
                                <p className={`text-base font-medium transition-all duration-300 ${isStepCompleted ? 'text-white/40 line-through decoration-white/20' : 'text-white'} ${isActive ? 'text-primary font-bold' : ''}`}>
                                    {step.title}
                                </p>
                                <p className="text-gray-500 text-xs uppercase tracking-tighter">Paso Atómico {step.id}</p>
                            </div>
                            <div className="shrink-0 pr-2">
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isStepCompleted ? 'border-primary bg-primary scale-110 shadow-[0_0_10px_rgba(13,147,242,0.5)]' : isActive ? 'border-primary/50' : 'border-neutral-700'}`}>
                                    {isStepCompleted && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thumb-neutral-700::-webkit-scrollbar-thumb { background: #404040; border-radius: 10px; }
            `}</style>
        </div>
    );
}
