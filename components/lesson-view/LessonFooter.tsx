'use client';

import Link from 'next/link';

interface LessonFooterProps {
    isComplete: boolean;
    onNext: () => void;
    downloadUrl?: string | null;
    nextLessonId?: string;
}

/**
 * Sticky footer with contextual actions.
 */
export default function LessonFooter({
    isComplete,
    onNext,
    downloadUrl,
    nextLessonId
}: LessonFooterProps) {
    return (
        <div className="p-6 bg-[#1A1A1A] border-t border-white/5 space-y-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {isComplete ? (
                <div className="space-y-3">
                    <button
                        onClick={onNext}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(34,197,94,0.4)] animate-in slide-in-from-bottom-2 btn-shine"
                    >
                        <span className="material-symbols-outlined font-bold">celebration</span>
                        <span className="text-lg uppercase">¡Diagnóstico Completado! {nextLessonId ? 'Siguiente Lección' : 'Volver al Inicio'}</span>
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
                    {downloadUrl && (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_14px_rgba(13,147,242,0.4)] active:scale-95 btn-shine"
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
    );
}
