'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface TimelineEvent {
    id: string;
    title: string;
    score: number;
    expectedScore: number;
    timeSpent: number;
    expectedTime: number;
    timestamp: string;
}

interface DigitalTwinTimelineProps {
    events: TimelineEvent[];
}

/**
 * DigitalTwinTimeline - Línea de tiempo telemetrizada.
 * Compara el rendimiento real vs. el esperado (IRT-lite).
 */
export function DigitalTwinTimeline({ events }: DigitalTwinTimelineProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">Vector de Evolución</h3>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-white/5 before:to-magenta-500/50">
                {events.map((event, idx) => {
                    const isOverperfoming = event.score > event.expectedScore;
                    const isTooFast = event.timeSpent < event.expectedTime * 0.5;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                        >
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[23px] top-1.5 size-2.5 rounded-full border-2 border-black z-10",
                                isOverperfoming ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                            )} />

                            <div className="bg-[#1A1A1A]/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="text-[11px] font-black text-white italic uppercase truncate max-w-[150px]">{event.title}</h4>
                                        <p className="text-[8px] font-mono text-zinc-600 uppercase mt-0.5">{new Date(event.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 py-0.5 rounded font-black text-[9px] uppercase",
                                        isOverperfoming ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {isOverperfoming ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.round(event.score)}%
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase">
                                            <span>Precisión</span>
                                            <span>{Math.round((event.score / (event.expectedScore || 1)) * 100)}% de esperado</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500/50 rounded-full" style={{ width: `${Math.min(100, (event.score / (event.expectedScore || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase">
                                            <span>Velocidad</span>
                                            <span className={cn(isTooFast && "text-amber-500")}>
                                                {isTooFast ? 'Adivinanza Rápida' : 'Conducta Normal'}
                                            </span>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full", isTooFast ? "bg-amber-500" : "bg-zinc-600")} style={{ width: `${Math.min(100, (event.expectedTime / (event.timeSpent || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black text-zinc-400 hover:text-white uppercase transition-all opacity-0 group-hover:opacity-100">
                                    <Eye size={12} />
                                    Ver Auditoría Detallada
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
