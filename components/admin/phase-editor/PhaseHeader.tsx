'use client';

import Link from 'next/link';

interface PhaseHeaderProps {
    courseId: string;
    lessonTitle: string;
    onSave: () => void;
    isPending: boolean;
    status: 'idle' | 'saving' | 'saved' | 'error';
    errorCount?: number;
    onScrollToError?: () => void;
}

/**
 * SRP: PhaseHeader handles navigation context and global workshop actions (Saving).
 */
export function PhaseHeader({
    courseId,
    lessonTitle,
    onSave,
    isPending,
    status,
    errorCount,
    onScrollToError
}: PhaseHeaderProps) {
    return (
        <div className="flex-1 flex items-center justify-between">
            {/* Breadcrumbs & Title */}
            <div className="flex items-center gap-6">
                <Link
                    href={`/admin/courses/${courseId}?tab=curriculum`}
                    className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    title="Volver a la Misión"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>

                <div className="h-8 w-[1px] bg-white/5 mx-2" />

                <div>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mb-1">Taller de Fase</p>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase italic truncate max-w-md">
                        {lessonTitle || 'Estructurando Fase...'}
                    </h1>
                </div>
            </div>

            {/* Actions & Feedback */}
            <div className="flex items-center gap-6">
                {errorCount !== undefined && errorCount > 0 && (
                    <button
                        onClick={onScrollToError}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer"
                        title="Haz clic para ir al primer error"
                    >
                        <span className="material-symbols-outlined !text-[14px] animate-pulse">report_problem</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{errorCount} ERRORES</span>
                    </button>
                )}

                {status !== 'idle' && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300 ${status === 'saving' ? 'bg-white/5 border-white/10 text-gray-400' :
                        status === 'saved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        <span className={`material-symbols-outlined !text-[14px] ${status === 'saving' ? 'animate-spin' : ''}`}>
                            {status === 'saving' ? 'sync' : status === 'saved' ? 'verified' : 'report'}
                        </span>
                        {status === 'saving' ? 'Sincronizando' : status === 'saved' ? 'Cambios Guardados' : 'Error al Guardar'}
                    </div>
                )}

                <button
                    onClick={onSave}
                    disabled={isPending}
                    className="bg-white text-black hover:bg-amber-500 transition-all disabled:opacity-50 font-black px-8 py-4 rounded-xl text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-2xl active:scale-95 group border border-transparent hover:border-amber-500/50"
                >
                    {isPending ? (
                        <span className="material-symbols-outlined animate-spin text-sm">settings_backup_restore</span>
                    ) : (
                        <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-700">save</span>
                    )}
                    GUARDAR PROGRESO
                </button>
            </div>
        </div>
    );
}
