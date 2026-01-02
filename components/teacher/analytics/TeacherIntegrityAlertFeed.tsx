"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TeacherIntegrityAlert } from '@/lib/actions/teacher/analytics/integrity-actions';

interface TeacherIntegrityAlertFeedProps {
    alerts: TeacherIntegrityAlert[];
}

export default function TeacherIntegrityAlertFeed({ alerts }: TeacherIntegrityAlertFeedProps) {
    if (alerts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 opacity-80">
                    check_circle
                </span>
                <h3 className="text-xl font-black text-emerald-400 mb-2 tracking-tight">
                    Operación Nominal
                </h3>
                <p className="text-sm text-emerald-500/70 max-w-md">
                    No se detectaron anomalías críticas en los instrumentos pedagógicos.
                    El sistema de diagnóstico está operando dentro de parámetros esperados.
                </p>
            </div>
        );
    }

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return "border-rose-500/30 bg-rose-500/5";
            case 'MEDIUM': return "border-amber-500/30 bg-amber-500/5";
            default: return "border-blue-500/30 bg-blue-500/5";
        }
    };

    const getSeverityIcon = (severity: string) => {
        const className = "w-6 h-6";
        switch (severity) {
            case 'CRITICAL': return <span className={`material-symbols-outlined text-rose-400 ${className}`}>error</span>;
            case 'MEDIUM': return <span className={`material-symbols-outlined text-amber-400 ${className}`}>warning</span>;
            default: return <span className={`material-symbols-outlined text-blue-400 ${className}`}>info</span>;
        }
    };

    const getAlertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'CONCEPT_DRIFT': 'Deriva Conceptual',
            'HIGH_SLIP': 'Ítem Ambiguo',
            'USELESS_DISTRACTOR': 'Distractor Inútil',
            'FRAGILE_PREREQUISITE': 'Prerrequisito Frágil'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">biotech</span>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        Alertas de Integridad
                    </h2>
                </div>
                <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                        {alerts.length} {alerts.length === 1 ? 'Alerta Activa' : 'Alertas Activas'}
                    </span>
                </div>
            </div>

            <div className="grid gap-4">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-6 rounded-2xl border ${getSeverityStyles(alert.severity)} relative overflow-hidden min-h-[44px]`}
                    >
                        {/* Subtle glow for critical alerts */}
                        {alert.severity === 'CRITICAL' && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -z-10" />
                        )}

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {getSeverityIcon(alert.severity)}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-wider text-white/60">
                                        {getAlertTypeLabel(alert.alert_type)}
                                    </span>
                                    <span className="text-xs font-mono text-white/40">
                                        {new Date(alert.created_at).toLocaleDateString('es-ES', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <p className="text-base text-white font-medium leading-relaxed">
                                    {alert.message}
                                </p>

                                {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                                    <div className="bg-black/20 rounded-xl p-3 text-xs font-mono flex flex-wrap gap-x-6 gap-y-2 text-white/70">
                                        {alert.metadata.slip_value && (
                                            <span>
                                                Slip: <span className="text-white font-bold">{(alert.metadata.slip_value * 100).toFixed(1)}%</span>
                                            </span>
                                        )}
                                        {alert.metadata.selection_rate && (
                                            <span>
                                                Selección: <span className="text-white font-bold">{(alert.metadata.selection_rate * 100).toFixed(1)}%</span>
                                            </span>
                                        )}
                                        {alert.question_id && (
                                            <span className="opacity-50">ID: {alert.question_id.substring(0, 8)}</span>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2 flex gap-3">
                                    <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[44px]">
                                        <span className="material-symbols-outlined text-base">visibility</span>
                                        Ver Detalle
                                    </button>
                                    <button className="flex-1 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[44px]">
                                        <span className="material-symbols-outlined text-base">check</span>
                                        Marcar Revisado
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
