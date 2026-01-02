"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Info,
    CheckCircle2,
    ArrowRight,
    Hammer,
    Trash2
} from 'lucide-react';
import { IntegrityAlert } from '@/lib/actions/admin/admin-analytics-actions';

interface IntegrityAlertFeedProps {
    alerts: IntegrityAlert[];
}

export default function IntegrityAlertFeed({ alerts }: IntegrityAlertFeedProps) {
    if (alerts.length === 0) {
        return (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
                <p className="text-sm font-medium">No se detectaron anomalías de integridad</p>
                <p className="text-xs opacity-60 mt-1">La maquinaria pedagógica está operando en parámetros nominales.</p>
            </div>
        );
    }

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return "border-rose-500/30 bg-rose-500/5 text-rose-400";
            case 'MEDIUM': return "border-amber-500/30 bg-amber-500/5 text-amber-400";
            default: return "border-blue-500/30 bg-blue-500/5 text-blue-400";
        }
    };

    const getAlertIcon = (type: string, severity: string) => {
        const className = "w-5 h-5";
        if (severity === 'CRITICAL') return <AlertCircle className={className} />;
        if (severity === 'MEDIUM') return <AlertTriangle className={className} />;
        return <Info className={className} />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Feed de Integridad Pedagógica
                </h3>
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-slate-400">
                    {alerts.length} ALERTAS ACTIVAS
                </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${getSeverityStyles(alert.severity)} group relative overflow-hidden`}
                    >
                        {/* Background subtle glow for critical */}
                        {alert.severity === 'CRITICAL' && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-3xl -z-10" />
                        )}

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-0.5">
                                {getAlertIcon(alert.alert_type, alert.severity)}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                                        {alert.alert_type.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] font-mono opacity-50">
                                        {new Date(alert.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm font-medium leading-snug">
                                    {alert.message}
                                </p>

                                {alert.metadata && (
                                    <div className="bg-black/20 rounded-lg p-2 text-[11px] font-mono flex flex-wrap gap-x-4 gap-y-1">
                                        {alert.metadata.slip_value && (
                                            <span>Slip: <span className="text-white">{(alert.metadata.slip_value * 100).toFixed(1)}%</span></span>
                                        )}
                                        {alert.metadata.selection_rate && (
                                            <span>Selection: <span className="text-white">{(alert.metadata.selection_rate * 100).toFixed(1)}%</span></span>
                                        )}
                                        {alert.question_id && (
                                            <span className="opacity-50">Ítem: {alert.question_id.substring(0, 8)}</span>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2 flex gap-2">
                                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Hammer className="w-3.5 h-3.5" />
                                        Recalibrar
                                    </button>
                                    <button className="flex-1 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Podar Ítem
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
