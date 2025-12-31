'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        console.error('Assessment Critical Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 text-white overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center space-y-8 relative z-10"
            >
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-black tracking-tight">Interrupción del Enlace</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Hemos detectado un inconveniente técnico. No te preocupes, <span className="text-amber-500 font-bold">tu progreso se guarda localmente</span> y será sincronizado automáticamente cuando se restablezca el enlace.
                    </p>
                </div>

                {/* Action Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Protocolo de Resiliencia</p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Tu sesión sigue activa. Puedes intentar refrescar la conexión o volver al panel principal.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black h-12 font-bold"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Reintentar Conexión
                    </Button>

                    <Link href="/" className="w-full">
                        <Button variant="ghost" className="w-full text-zinc-500 hover:text-white hover:bg-white/5 h-12">
                            <Home className="w-4 h-4 mr-2" /> Volver al Inicio
                        </Button>
                    </Link>
                </div>

                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                    Error ID: {error.digest || 'UNKNOWN_DIAGNOSTIC_FAILURE'}
                </p>
            </motion.div>
        </div>
    );
}
