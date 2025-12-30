'use client';

import { StepData, StepType } from '../StepCard';

interface StepContentTypeProps {
    step: StepData;
    onUpdate: (updates: Partial<StepData>) => void;
}

export function StepContentVideo({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Configuración de Video Master
                </p>
                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    Este paso presentará una lección en video. Asegúrate de que el título sea descriptivo para que el alumno sepa qué esperar.
                </p>
            </div>
            {/* Aquí podrían ir campos específicos de video en el futuro, como timestamp de inicio, etc. */}
        </div>
    );
}

export function StepContentQuiz({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">quiz</span>
                    Control LEGO (Evaluación)
                </p>
                <input
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] text-white placeholder:text-gray-700 outline-none focus:ring-1 ring-emerald-500"
                    placeholder="Pregunta de control rápido..."
                />
            </div>
        </div>
    );
}

export function StepContentResource({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-[10px] text-blue-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">attachment</span>
                    Recurso para Descargar
                </p>
                <div className="flex items-center gap-3">
                    <button className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        Vincular Archivo
                    </button>
                    <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-600">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StepContentPractice({ step, onUpdate }: StepContentTypeProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                <p className="text-[10px] text-purple-500/80 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">brush</span>
                    Práctica Libre Atómica
                </p>
                <textarea
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-[11px] text-white placeholder:text-gray-700 outline-none focus:ring-1 ring-purple-500 min-h-[60px] resize-none"
                    placeholder="Instrucciones para la práctica de dibujo..."
                />
            </div>
        </div>
    );
}
