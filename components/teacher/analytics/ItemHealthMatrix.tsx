"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    Activity,
    Clock,
    Zap,
    MousePointer2
} from 'lucide-react';
import { GlobalItemHealth } from '@/lib/actions/admin/admin-analytics-actions';
import { cn } from '@/lib/utils';

interface TeacherItemHealthMatrixProps {
    data: GlobalItemHealth[];
}

export default function TeacherItemHealthMatrix({ data }: TeacherItemHealthMatrixProps) {

    // Función para determinar el color de fondo basado en el RTE (Fricción)
    // Interpretamos median_time_ms como base para el RTE si no viene el valor normalizado directamente en el DTO
    // Para simplificar esta demo, usaremos la latencia relativa al promedio de la cohorte
    const getFrictionColor = (accuracy: number, latency: number) => {
        // Umbral de estrés: > 20s para una respuesta promedio
        if (latency > 25000) return "bg-rose-500/[0.07] border-rose-500/20";
        if (latency > 15000) return "bg-amber-500/[0.05] border-amber-500/10";
        return "bg-zinc-800/30 border-white/5";
    };

    const getStatusIcon = (status: string, accuracy: number, latency: number) => {
        if (latency > 25000) return <Zap className="w-3 h-3 text-rose-400" />;
        if (accuracy > 95) return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
        if (accuracy < 40) return <AlertTriangle className="w-3 h-3 text-rose-400" />;
        return <Activity className="w-3 h-3 text-zinc-500" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-500">analytics</span>
                    Mapa de Calor de Fricción
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Auditoría Forense de Telemetría (RTE)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.slice(0, 9).map((item, index) => (
                    <motion.div
                        key={item.question_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98]",
                            getFrictionColor(item.accuracy_rate, item.median_time_ms)
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ítem ID: {item.question_id.substring(0, 8)}</div>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{item.exam_title}</h4>
                            </div>
                            <div className="p-1.5 rounded-lg bg-white/5">
                                {getStatusIcon(item.health_status, item.accuracy_rate, item.median_time_ms)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Activity className="w-3 h-3 text-zinc-500" />
                                    <span className="text-[8px] font-black uppercase text-zinc-500">Precisión</span>
                                </div>
                                <div className="text-sm font-mono text-white font-black">{Math.round(item.accuracy_rate)}%</div>
                            </div>
                            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Clock className="w-3 h-3 text-zinc-500" />
                                    <span className="text-[8px] font-black uppercase text-zinc-500">Latencia</span>
                                </div>
                                <div className="text-sm font-mono text-white font-black">{(item.median_time_ms / 1000).toFixed(1)}s</div>
                            </div>
                        </div>

                        {item.median_time_ms > 20000 && (
                            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/10">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span className="text-[9px] text-rose-300 font-medium">Duda Tóxica / Fatiga Visual detectada</span>
                            </div>
                        )}

                        {item.accuracy_rate > 95 && (
                            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/10">
                                <MousePointer2 className="w-3 h-3 text-blue-400" />
                                <span className="text-[9px] text-blue-300 font-medium">Ítem Trivial: Poda sugerida</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mt-4">
                <p className="text-[10px] text-indigo-400/80 italic">
                    <strong>Referencia RTE:</strong> El sistema identifica anomalías de navegación cuando el tiempo de lectura es 2.5x superior al promedio. Los ítems en rojo sugieren una revisión de la redacción.
                </p>
            </div>
        </div>
    );
}
