'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Assessment Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl">
                <div className="inline-flex size-20 items-center justify-center bg-red-500/10 rounded-3xl text-red-500">
                    <AlertCircle size={40} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Algo salió mal
                    </h1>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Hemos tenido un problema técnico al cargar el examen. No te preocupes, tus respuestas se guardan automáticamente en la nube frecuentemente.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-white text-black h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <RefreshCcw size={16} />
                        Intentar de nuevo
                    </button>

                    <Link
                        href="/dashboard"
                        className="w-full border border-white/10 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={16} />
                        Volver al Inicio
                    </Link>
                </div>

                <div className="pt-4">
                    <p className="text-[10px] text-zinc-700 font-mono uppercase">
                        Error Digest: {error.digest || 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
}
