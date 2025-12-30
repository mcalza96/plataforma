'use client';

interface KnowledgeDelta {
    category: string;
    initial: number;
    current: number;
}

interface DeltaChartProps {
    data: KnowledgeDelta[];
}

export default function DeltaChart({ data }: DeltaChartProps) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500">trending_up</span>
                Evolución Atómica (Delta)
            </h3>
            <div className="space-y-8">
                {data.map((delta) => {
                    const growth = delta.current - delta.initial;
                    return (
                        <div key={delta.category} className="group">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 ml-1">
                                <span>{delta.category}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 font-bold tracking-tighter">BASE: {delta.initial}%</span>
                                    <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">+{growth}% IMPACTO</span>
                                </div>
                            </div>
                            <div className="h-6 w-full bg-black/20 rounded-lg flex overflow-hidden p-1 border border-white/5 group-hover:border-white/10 transition-all">
                                {/* Initial Level Bar */}
                                <div
                                    className="h-full bg-gray-800 rounded-sm relative"
                                    style={{ width: `${delta.initial}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/5"></div>
                                </div>
                                {/* Growth Delta Bar */}
                                {growth > 0 && (
                                    <div
                                        className="h-full bg-amber-500 rounded-sm relative shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-in slide-in-from-left duration-1000"
                                        style={{ width: `${growth}%`, marginLeft: '2px' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-medium italic text-center">
                    * El "Delta" representa el crecimiento exponencial desde el primer diagnóstico.
                </p>
            </div>
        </div>
    );
}
