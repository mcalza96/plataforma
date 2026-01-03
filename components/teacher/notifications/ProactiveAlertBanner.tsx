"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Brain,
    Zap,
    Scissors,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { PedagogicalAlert } from '@/lib/application/services/notifications/pedagogical-advisor';
import { executeSmartPruning } from '@/lib/actions/teacher/pedagogical-actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface ProactiveAlertBannerProps {
    alerts: PedagogicalAlert[];
}

export default function ProactiveAlertBanner({ alerts }: ProactiveAlertBannerProps) {
    const [isExecuting, setIsExecuting] = useState<string | null>(null);
    const [visibleAlerts, setVisibleAlerts] = useState(alerts);
    const { showToast } = useToast();

    if (visibleAlerts.length === 0) return null;

    const handlePruning = async (alertId: string) => {
        setIsExecuting(alertId);
        try {
            const result = await executeSmartPruning(alertId);
            if (result.success) {
                showToast(result.message, 'success');
                setVisibleAlerts(prev => prev.filter(a => a.id !== alertId));
            }
        } catch (error) {
            showToast("Error al ejecutar la poda.", 'error');
            console.error(error);
        } finally {
            setIsExecuting(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'COGNITIVE_BIAS': return <Brain className="w-5 h-5 text-rose-400" />;
            case 'VISUAL_FATIGUE': return <Zap className="w-5 h-5 text-amber-400" />;
            case 'SMART_PRUNING': return <Scissors className="w-5 h-5 text-blue-400" />;
            default: return <AlertCircle className="w-5 h-5 text-zinc-400" />;
        }
    };

    const getBorderColor = (severity: string) => {
        switch (severity) {
            case 'HIGH': return 'border-rose-500/50 bg-rose-500/5';
            case 'MEDIUM': return 'border-amber-500/50 bg-amber-500/5';
            default: return 'border-blue-500/50 bg-blue-500/5';
        }
    };

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Sugerencias de Intervención Directa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode='popLayout'>
                    {visibleAlerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            className={cn(
                                "relative p-5 rounded-2xl border backdrop-blur-md overflow-hidden group",
                                getBorderColor(alert.severity)
                            )}
                        >
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-white/5 h-fit">
                                    {getIcon(alert.type)}
                                </div>

                                <div className="space-y-1 pr-8">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {alert.title}
                                        {alert.severity === 'HIGH' && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-[8px] font-black uppercase text-white animate-pulse">Crítico</span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed md:line-clamp-2">
                                        {alert.message}
                                    </p>
                                    <p className="text-[11px] text-zinc-300 italic font-medium pt-1">
                                        &quot;{alert.suggestion}&quot;
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                {alert.type === 'SMART_PRUNING' ? (
                                    <button
                                        onClick={() => handlePruning(alert.id)}
                                        disabled={isExecuting !== null}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95"
                                    >
                                        {isExecuting === alert.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Scissors className="w-3 h-3" />
                                        )}
                                        {isExecuting === alert.id ? 'Podando...' : 'Podar Distractor'}
                                    </button>
                                ) : (
                                    <button
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
                                        onClick={() => setVisibleAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                    >
                                        Entendido
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                {getIcon(alert.type)}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
