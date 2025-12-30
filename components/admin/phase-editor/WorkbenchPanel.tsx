'use client';

import StepTimeline from '@/components/admin/StepTimeline';

interface WorkbenchPanelProps {
    lessonId: string;
    timelineKey: number;
    totalSteps: number;
    onUpdateSteps: (count: number) => void;
}

export default function WorkbenchPanel({ lessonId, timelineKey, totalSteps, onUpdateSteps }: WorkbenchPanelProps) {
    return (
        <div className="bg-black/20 border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-inner min-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-2 px-2">
                <span className="material-symbols-outlined text-amber-500">architecture</span>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Workbench Atómico</h3>
            </div>

            <div className="flex-1">
                <StepTimeline
                    key={`timeline-${lessonId}-${timelineKey}`}
                    initialStepsCount={totalSteps}
                    onChange={onUpdateSteps}
                />
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-medium italic text-center">
                    Arrastra para reordenar los bloques de aprendizaje. La IA puede ayudarte a estructurarlos en el panel derecho.
                </p>
            </div>
        </div>
    );
}
