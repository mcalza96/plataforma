"use client";

import React from 'react';
import {
    AlertTriangle,
    ShieldAlert,
    Smartphone,
    Monitor,
    Users,
    ArrowRight
} from 'lucide-react';
import { DIFAlert } from '@/lib/actions/admin/admin-analytics-actions';

interface DIFQuarantineTableProps {
    alerts: DIFAlert[];
}

export default function DIFQuarantineTable({ alerts }: DIFQuarantineTableProps) {
    return (
        <div className="bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Ítems en Cuarentena (DIF)</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Detectado funcionamiento diferencial por grupo o dispositivo</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400">
                    {alerts.length} ALERTAS ACTIVAS
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">ID Ítem</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Brecha (Gap)</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Estado de Sesgo</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Dimensión Crítica</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {alerts.map((alert) => (
                            <tr key={alert.question_id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono text-slate-300">{alert.question_id.substring(0, 12)}...</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${alert.status === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                style={{ width: `${alert.gap * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-bold ${alert.status === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                                            {Math.round(alert.gap * 100)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${alert.status === 'CRITICAL'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        {alert.status === 'CRITICAL' ? 'Sesgo Crítico' : 'Alerta de Paridad'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                                        {/* Note: dimension would ideally come from server but we mock it based on gap for now or use generic icons */}
                                        <Users className="w-3 h-3" />
                                        <span className="uppercase font-bold tracking-widest">Demografía</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {alerts.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-600">
                    <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No se detectaron sesgos críticos</p>
                </div>
            )}
        </div>
    );
}
