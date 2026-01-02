"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    Clock,
    TrendingUp,
    Coins,
    AlertCircle,
    CheckCircle2,
    Zap,
    BarChart3
} from 'lucide-react';
import { TelemetryStats } from '@/lib/actions/admin/admin-analytics-actions';

interface TelemetryDashboardProps {
    stats: TelemetryStats;
}

export default function TelemetryDashboard({ stats }: TelemetryDashboardProps) {
    const { aiEfficiency, timeCalibration, usageTrend } = stats;

    const maxTrend = Math.max(...usageTrend.map(d => d.count), 1);

    // SVG Polyline points for usage trend
    const points = usageTrend.map((d, i) => {
        const x = (i / (usageTrend.length - 1)) * 100;
        const y = 100 - (d.count / maxTrend) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {/* IA Efficiency Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#252525] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-indigo-400">
                            <Cpu className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-500/80">Eficiencia de IA</span>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 uppercase">
                            Operational Cost
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-mono font-black text-white">$</span>
                        <span className="text-5xl font-mono font-black text-white tracking-tighter">
                            {aiEfficiency.totalCost.toFixed(2)}
                        </span>
                        <span className="text-gray-500 font-mono text-sm ml-2">USD Acumulados</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Tokens Totales</p>
                            <p className="text-lg font-mono font-bold text-slate-300">
                                {(aiEfficiency.totalTokens / 1000).toFixed(1)}k
                            </p>
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Costo/Examen</p>
                            <p className="text-lg font-mono font-bold text-emerald-400">
                                ${aiEfficiency.avgCostPerExam.toFixed(3)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            Distribución de Modelos
                        </p>
                        <div className="flex h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            {aiEfficiency.modelDistribution.map((m, i) => {
                                const percentage = (m.tokens / aiEfficiency.totalTokens) * 100;
                                return (
                                    <div
                                        key={m.model}
                                        className={`h-full ${i % 2 === 0 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-indigo-300'}`}
                                        style={{ width: `${percentage}%` }}
                                        title={`${m.model}: ${Math.round(percentage)}%`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {aiEfficiency.modelDistribution.map((m, i) => (
                                <div key={m.model} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-indigo-300'}`} />
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">
                                        {m.model}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Effort Calibration Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-[#252525] border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Clock className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest text-amber-500/80">Calibración de Esfuerzo</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${timeCalibration.status === 'CALIBRATED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                timeCalibration.status === 'OVERLOADED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' :
                                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                            {timeCalibration.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Tiempo Real (Avg)</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-mono font-black text-white">
                                    {Math.round(timeCalibration.avgRealDurationSeconds / 60)}
                                </span>
                                <span className="text-sm font-mono text-gray-500">MIN</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Tiempo Esperado</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-mono font-black text-slate-400">
                                    {Math.round(timeCalibration.avgExpectedDurationSeconds / 60)}
                                </span>
                                <span className="text-sm font-mono text-gray-500">MIN</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase">Índice de Desviación</span>
                            <span className={timeCalibration.deviationIndex > 1 ? 'text-rose-400' : 'text-emerald-400'}>
                                {timeCalibration.deviationIndex > 1 ? '+' : ''}
                                {Math.round((timeCalibration.deviationIndex - 1) * 100)}%
                            </span>
                        </div>
                        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="absolute left-1/2 -ml-[1px] h-full w-[2px] bg-white/20 z-10" />
                            <motion.div
                                className={`h-full absolute left-1/2 transform transition-all ${timeCalibration.deviationIndex > 1 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(Math.abs(timeCalibration.deviationIndex - 1) * 50, 50)}%`,
                                    left: timeCalibration.deviationIndex > 1 ? '50%' : `calc(50% - ${Math.min(Math.abs(timeCalibration.deviationIndex - 1) * 50, 50)}%)`
                                }}
                            />
                        </div>
                    </div>

                    {timeCalibration.status !== 'CALIBRATED' && (
                        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${timeCalibration.status === 'OVERLOADED' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-amber-500/5 border-amber-500/10'
                            }`}>
                            <AlertCircle className={`w-4 h-4 mt-0.5 ${timeCalibration.status === 'OVERLOADED' ? 'text-rose-400' : 'text-amber-400'}`} />
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {timeCalibration.status === 'OVERLOADED'
                                    ? "Detectada fatiga cognitiva masiva. Los alumnos tardan un 30% más de lo previsto. El diseño pedagógico actual rompe la fluidez."
                                    : "Los exámenes son triviales. El tiempo de resolución es significativamente menor al esperado. Riesgo de subestimación del conocimiento."}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Usage Trend Chart Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-[#252525] border border-white/5 rounded-3xl p-8 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-gray-500" />
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Volumen de Diagnósticos (30 días)</span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-mono font-black text-white">{maxTrend}</p>
                            <p className="text-[10px] font-bold text-gray-600 uppercase">Pico de Actividad</p>
                        </div>
                    </div>

                    <div className="relative h-40 w-full">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                            {/* Area gradient */}
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M 0,100 L ${points} L 100,100 Z`}
                                fill="url(#areaGradient)"
                            />
                            {/* Main line */}
                            <motion.path
                                d={`M ${points}`}
                                fill="none"
                                stroke="rgb(99, 102, 241)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            {/* Points */}
                            {usageTrend.map((d, i) => {
                                const x = (i / (usageTrend.length - 1)) * 100;
                                const y = 100 - (d.count / maxTrend) * 100;
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="0.5"
                                        fill="white"
                                        className="opacity-40 group-hover:opacity-100 transition-opacity"
                                    />
                                );
                            })}
                        </svg>

                        <div className="flex justify-between mt-4">
                            {usageTrend.filter((_, i) => i % 5 === 0).map((d, i) => (
                                <span key={i} className="text-[9px] font-mono text-gray-600 uppercase">
                                    {d.date.split('-').slice(1).join('/')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Tailward plugin for spin slow if not defined:
// animation: { 'spin-slow': 'spin 3s linear infinite' }
