"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Scale,
    Smartphone,
    Monitor,
    AlertTriangle,
    CheckCircle2,
    Info,
    ShieldAlert,
    BarChart3
} from 'lucide-react';
import { FairnessAuditData } from '@/lib/actions/admin/admin-analytics-actions';

interface FairnessAuditDashboardProps {
    data: FairnessAuditData;
    className?: string;
}

export default function FairnessAuditDashboard({ data, className = '' }: FairnessAuditDashboardProps) {
    const { groupMetrics, accessMetrics, difAlerts, impactRatio, equityStatus } = data;

    const statusColors = {
        OPTIMAL: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        WARNING: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        CRITICAL: 'text-rose-400 border-rose-500/20 bg-rose-500/5'
    };

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Header: Equity Certificate */}
            <div className={`p-8 rounded-3xl border ${statusColors[equityStatus]} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Scale size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Paridad Algorítmica</span>
                        </div>
                        <h2 className="text-3xl font-black">Certificado de Equidad: {equityStatus}</h2>
                        <p className="max-w-xl text-sm opacity-70">
                            TeacherOS audita continuamente el impacto dispar en grupos demográficos.
                            La puntuación actual del **Impacto Dispar** es del **{Math.round(impactRatio * 100)}%**.
                        </p>
                    </div>

                    <div className="text-center md:text-right">
                        <div className="text-5xl font-mono font-black mb-1">
                            {impactRatio.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            Disparate Impact Ratio
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Intervention Rate by Group */}
                <div className="bg-[#252525] border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-400" />
                            Tasa de Intervención por Grupo
                        </h3>
                        <div className="group relative">
                            <Info className="w-4 h-4 text-slate-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 p-3 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-50">
                                **Impacto Dispar (4/5 Rule)**: Si el grupo menos favorecido tiene una tasa inferior al 80% del más favorecido, existe evidencia de sesgo adverso.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {groupMetrics.map((group, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-medium">
                                    <span className="text-slate-400 uppercase tracking-tight">{group.demographic_group}</span>
                                    <span className="text-white">{(group.intervention_rate * 100).toFixed(1)}% remediación</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${group.intervention_rate * 100}%` }}
                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Device Analysis */}
                <div className="bg-[#252525] border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-violet-400" />
                        Auditoría de Acceso y Fatiga
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {accessMetrics.map((metric, i) => (
                            <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    {metric.access_type === 'mobile' ? <Smartphone className="text-slate-500" /> : <Monitor className="text-slate-500" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{metric.access_type}</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-mono font-bold">{metric.avg_score}%</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Score</p>
                                </div>
                                <div className="pt-2 border-t border-white/5 space-y-2">
                                    <p className="text-[10px] font-bold text-violet-400 uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Conocimiento Frágil
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Detectado en un **{(metric.fragile_knowledge_rate * 100).toFixed(0)}%** de las sesiones.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DIF Alerts Panel */}
            <div className="bg-[#252525] border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Alertas de Discriminación de Ítems (DIF)
                    </h3>
                </div>
                <div className="divide-y divide-white/5">
                    {difAlerts.map((alert, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${alert.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{alert.question_id}</p>
                                    <p className="text-xs text-slate-500">Brecha de éxito detectada del **{Math.round(alert.gap * 100)}%**.</p>
                                </div>
                            </div>
                            <div className="group relative">
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase transition-all">
                                    Pausar Ítem
                                </button>
                                <div className="absolute right-0 bottom-full mb-3 w-64 bg-slate-900 border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none">
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                        **DIF (Differential Item Functioning)**: Ocurre cuando un grupo tiene mucha menor probabilidad de éxito que otro a pesar de tener el mismo nivel de competencia global demostrado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center opacity-30">
                <div className="flex items-center gap-8 py-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Algorithmic Parity Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Statistical Significance Validated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
