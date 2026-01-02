"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlobalItemHealth } from '@/lib/actions/admin/admin-analytics-actions';
import {
    Activity,
    AlertTriangle,
    Target,
    Settings,
    Zap
} from 'lucide-react';

interface ItemCalibrationHeatmapProps {
    items: GlobalItemHealth[];
}

export default function ItemCalibrationHeatmap({ items }: ItemCalibrationHeatmapProps) {
    // Filter items that have calibration data
    const calibratedItems = items.filter(item => item.slip_param !== undefined && item.guess_param !== undefined);

    if (calibratedItems.length === 0) {
        return (
            <div className="bg-[#252525] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
                <Settings className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Sin datos de calibración IRT/DINA</p>
                <p className="text-xs opacity-60 mt-1">Se requieren al menos 10 intentos por examen para iniciar la calibración empírica.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#252525] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        Mapa de Fricción Forense (DINA)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Distribución de Slip ($s_j$) vs Guess ($g_j$) para {calibratedItems.length} reactivos.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Broken</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trivial</span>
                    </div>
                </div>
            </div>

            <div className="p-10">
                {/* Heatmap Grid Layout */}
                <div className="relative aspect-video w-full border-l-2 border-b-2 border-white/10">
                    {/* Y-Axis Label (Slip) */}
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                        Slip (s_j) - Fracaso del Experto
                    </div>

                    {/* X-Axis Label (Guess) */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                        Guess (g_j) - Acierto por Azar
                    </div>

                    {/* Threshold Lines */}
                    {/* Slip Critical Line (> 0.4) */}
                    <div className="absolute left-0 right-0 h-px bg-rose-500/20 border-t border-dashed border-rose-500/50" style={{ bottom: '40%' }}>
                        <span className="absolute -right-16 -top-2 text-[9px] font-bold text-rose-500/70">UMBRAL AMBIGÜEDAD (0.4)</span>
                    </div>

                    {/* Guess/Trivial Zone (High Guess, Low Slip) */}
                    <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-amber-500/5 border-l border-t border-amber-500/20" />

                    {/* Data Points */}
                    {calibratedItems.map((item, idx) => {
                        const x = (item.guess_param || 0) * 100;
                        const y = (item.slip_param || 0) * 100;
                        const isBroken = (item.slip_param || 0) > 0.4;
                        const isTrivial = item.accuracy_rate > 95 && (item.median_time_ms || 0) < 5000;

                        return (
                            <motion.div
                                key={item.question_id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.01 }}
                                className={`absolute w-3 h-3 rounded-full border-2 cursor-pointer group z-10 
                                    ${isBroken ? 'bg-rose-500 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                                        isTrivial ? 'bg-amber-500 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                            'bg-blue-500 border-blue-400'}`}
                                style={{ left: `${x}%`, bottom: `${y}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#1A1A1A] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                                    <p className="text-[10px] font-bold text-slate-500 mb-1">{item.exam_title}</p>
                                    <p className="text-xs font-mono text-white mb-2">{item.question_id.substring(0, 8)}</p>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div>
                                            <p className="text-slate-500">Slip</p>
                                            <p className={isBroken ? 'text-rose-400 font-bold' : 'text-white'}>{(item.slip_param! * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Guess</p>
                                            <p className="text-white">{(item.guess_param! * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    {isBroken && (
                                        <div className="mt-2 text-[9px] text-rose-400 font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            CRITICAL: AMBIGÜEDAD
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Background Grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-5">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="border border-white" />
                        ))}
                    </div>
                </div>

                {/* Legend / Metrics */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Avg. Slip (Global)</p>
                        <p className="text-xl font-bold text-white">
                            {(calibratedItems.reduce((acc, i) => acc + (i.slip_param || 0), 0) / calibratedItems.length * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Avg. Guess (Global)</p>
                        <p className="text-xl font-bold text-white">
                            {(calibratedItems.reduce((acc, i) => acc + (i.guess_param || 0), 0) / calibratedItems.length * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Ítems Broken</p>
                        <p className="text-xl font-bold text-rose-500">
                            {calibratedItems.filter(i => (i.slip_param || 0) > 0.4).length}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500">Ítems Triviales</p>
                        <p className="text-xl font-bold text-amber-500">
                            {calibratedItems.filter(i => i.accuracy_rate > 95 && (i.median_time_ms || 0) < 5000).length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
