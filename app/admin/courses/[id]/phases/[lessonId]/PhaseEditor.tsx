'use client';

import { usePhaseEditor } from '@/hooks/admin/use-phase-editor';
import PhaseEditorLayout from '@/components/admin/phase-editor/PhaseEditorLayout';
import ContextPanel from '@/components/admin/phase-editor/ContextPanel';
import WorkbenchPanel from '@/components/admin/phase-editor/WorkbenchPanel';
import ToolsPanel from '@/components/admin/phase-editor/ToolsPanel';
import { Lesson } from '@/lib/domain/course';

interface PhaseEditorProps {
    courseId: string;
    lesson: Lesson;
    allLessons: Lesson[];
}

export default function PhaseEditor({ courseId, lesson, allLessons }: PhaseEditorProps) {
    const {
        formData,
        isPending,
        message,
        timelineKey,
        updateField,
        save,
        remove,
        applyAISuggestion,
    } = usePhaseEditor(lesson, courseId);

    const Header = (
        <div className="sticky top-24 z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
            {/* Feedback Toast Inline in Header Space for better visibility */}
            {message && (
                <div className={`absolute -top-12 right-0 px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                    <span className="font-black text-[10px] uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="flex items-center gap-6">
                <div className="size-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-2xl italic text-amber-500">
                    {formData.order}
                </div>
                <div>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">Editor de Fase Atómica</p>
                    <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
                        {formData.title || 'Nueva Fase de Misión'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={remove}
                    className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                >
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                </button>
                <button
                    onClick={save}
                    disabled={isPending}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black px-10 py-4 rounded-2xl text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 group uppercase"
                >
                    {isPending ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-500">auto_awesome</span>}
                    Sincronizar Fase
                </button>
            </div>
        </div>
    );

    return (
        <PhaseEditorLayout
            header={Header}
            contextPanel={
                <ContextPanel
                    formData={formData}
                    allLessons={allLessons}
                    onUpdateField={updateField}
                />
            }
            workbenchPanel={
                <WorkbenchPanel
                    lessonId={lesson.id}
                    timelineKey={timelineKey}
                    totalSteps={formData.total_steps}
                    onUpdateSteps={(count) => updateField('total_steps', count)}
                />
            }
            toolsPanel={
                <ToolsPanel
                    thumbnailUrl={formData.thumbnail_url || ''}
                    downloadUrl={formData.download_url || ''}
                    onUpdateField={updateField}
                    onApplyAISuggestion={applyAISuggestion}
                />
            }
        />
    );
}
