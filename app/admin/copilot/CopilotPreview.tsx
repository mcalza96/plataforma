'use client';

import { useObject } from 'ai/react';
import { ProposalSchema } from '@/lib/validations';
import { Skeleton } from '@/components/ui/skeletons'; // Asumiendo que existe o crearé uno simple

export default function CopilotPreview({ diagnosis }: { diagnosis: any }) {
    const { object, submit, isLoading } = useObject({
        api: '/api/ai/plan',
        schema: ProposalSchema,
    });

    const triggerGeneration = () => {
        submit({ diagnosis });
    };

    return (
        <div className="space-y-6">
            <button
                onClick={triggerGeneration}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                disabled={isLoading}
            >
                {isLoading ? 'Consultando al Secretario...' : 'Consultar Secretario Técnico'}
            </button>

            {object && (
                <div className="bg-[#252525] border border-white/5 rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Propuesta Sugerida</p>
                        <h2 className="text-3xl font-black text-white">{object.suggested_title || <Skeleton className="h-8 w-3/4 bg-white/5" />}</h2>
                        <p className="text-gray-400 text-sm italic">{object.rationale || <Skeleton className="h-4 w-full bg-white/5" />}</p>
                    </div>

                    <div className="grid gap-4">
                        {(object.modules || Array.from({ length: 3 })).map((mod: any, i: number) => (
                            <div key={mod?.content_id || i} className="group relative flex items-center gap-6 bg-black/20 border border-white/5 p-6 rounded-2xl hover:border-amber-500/30 transition-all overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/0 group-hover:bg-amber-500 transition-all" />
                                <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-xl font-black text-gray-500 group-hover:text-amber-500 transition-colors">
                                    {mod?.order || i + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                                        {mod?.content_id ? `Módulo: ${mod.content_id.slice(0, 8)}` : <Skeleton className="h-5 w-48 bg-white/5" />}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                        {mod?.reason || <Skeleton className="h-3 w-64 bg-white/5" />}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-600 group-hover:text-amber-500 transition-colors">
                                    rocket_launch
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
