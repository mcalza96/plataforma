"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DistractorStats } from '@/lib/actions/admin/admin-architecture-actions';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Trash2,
    Link as LinkIcon,
    Users
} from 'lucide-react';

interface DistractorEfficiencyChartProps {
    distractors: DistractorStats[];
    totalResponses: number;
    onPrune?: (id: string) => void;
    onLink?: (id: string) => void;
}

export default function DistractorEfficiencyChart({
    distractors,
    totalResponses,
    onPrune,
    onLink
}: DistractorEfficiencyChartProps) {
    // Sort: Correct first, then others by rate
    const sorted = [...distractors].sort((a, b) => {
        if (a.is_correct) return -1;
        if (b.is_correct) return 1;
        return b.selection_rate - a.selection_rate;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Eficiencia de Distractores (NRM)
                </h4>
                <div className="flex gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1 text-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> VÁLIDO
                    </div>
                    <div className="flex items-center gap-1 text-rose-500">
                        <div className="w-2 h-2 rounded-full bg-rose-500" /> RUIDO
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                        <div className="w-2 h-2 rounded-full bg-amber-500" /> AMBIGUO
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {sorted.map((dist, index) => {
                    const isUseless = dist.is_useless;
                    const isCritical = dist.is_critical;
                    const isCorrect = dist.is_correct;

                    let barColor = "bg-slate-700";
                    if (isCorrect) barColor = "bg-emerald-500/40";
                    else if (isCritical) barColor = "bg-amber-500/40";
                    else if (isUseless) barColor = "bg-rose-500/40";

                    return (
                        <motion.div
                            key={dist.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-black/20'} relative overflow-hidden group`}
                        >
                            {/* The Bar */}
                            <div
                                className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-1000 -z-10`}
                                style={{ width: `${dist.selection_rate * 100}%` }}
                            />

                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {isCorrect ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : isCritical ? (
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                        )}
                                        <span className="text-sm font-medium text-slate-200">{dist.content}</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {dist.selection_count} respuestas
                                        </span>
                                        <span className="font-bold text-white">
                                            {(dist.selection_rate * 100).toFixed(1)}%
                                        </span>
                                        {dist.master_selection_count > 0 && (
                                            <span className="text-amber-400">
                                                Masters: {dist.master_selection_count}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isCorrect && (
                                        <>
                                            <button
                                                onClick={() => onLink?.(dist.id)}
                                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                                                title="Vincular a Nodo Sombra"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onPrune?.(dist.id)}
                                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors border border-rose-500/20"
                                                title="Podar Distractor Inútil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Alert badges */}
                            <div className="mt-2 flex gap-2">
                                {isUseless && (
                                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-tighter rounded border border-rose-500/20">
                                        Poda Sugerida
                                    </span>
                                )}
                                {isCritical && (
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-tighter rounded border border-amber-500/20">
                                        Ambigüedad Detectada
                                    </span>
                                )}
                                {dist.diagnoses_misconception_id && (
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-tighter rounded border border-blue-500/20">
                                        Vinculado a Nodo Sombra
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-[10px] text-slate-500 italic mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                **Nota de Ingeniería:** Los distractores en rojo son ineficientes ({"<"}5% selection). Los amarillos atraen a estudiantes de alto rendimiento, lo que indica que la opción es plausible en el modelo mental incorrecto o el ítem está sesgado.
            </p>
        </div>
    );
}
