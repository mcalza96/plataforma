"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Layers,
    Scissors,
    BrainCircuit,
    TrendingDown,
    Activity,
    ChevronRight,
    Search,
    AlertCircle
} from 'lucide-react';
import {
    getItemArchitectureDetail,
    ItemArchitectureDetail,
    pruneDistractor,
    linkDistractorToMisconception
} from '@/lib/actions/admin/admin-architecture-actions';
import DistractorEfficiencyChart from './DistractorEfficiencyChart';
import ConceptDriftMonitor from './ConceptDriftMonitor';

interface ItemArchitectureAuditProps {
    probeId: string;
    onClose: () => void;
}

export default function ItemArchitectureAudit({ probeId, onClose }: ItemArchitectureAuditProps) {
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<ItemArchitectureDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDetail();
    }, [probeId]);

    const loadDetail = async () => {
        try {
            setLoading(true);
            const data = await getItemArchitectureDetail(probeId);
            setDetail(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrune = async (optionId: string) => {
        if (!confirm("¿Seguro que deseas eliminar este distractor? Esto afectará futuras evaluaciones.")) return;
        try {
            await pruneDistractor(optionId);
            await loadDetail();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#252525] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1A1A1A]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Layers className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Auditoría de Arquitectura de Ítem</h2>
                            <p className="text-xs text-slate-500 font-mono">PROBE_ID: {probeId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4">
                            <Activity className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-slate-500 font-medium">Reconstruyendo árbol de decisión cognitivo...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-xl flex items-center gap-4 text-rose-400">
                            <AlertCircle className="w-6 h-6" />
                            <p>{error}</p>
                        </div>
                    ) : detail && (
                        <>
                            {/* Stem Preview */}
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                <span className="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-blue-500/20">
                                    Enunciado Maestro
                                </span>
                                <p className="text-lg text-white font-medium leading-relaxed">
                                    {detail.stem}
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Left Side: Efficiency Chart */}
                                <div className="lg:col-span-2 space-y-8">
                                    <DistractorEfficiencyChart
                                        distractors={detail.distractors}
                                        totalResponses={detail.total_responses}
                                        onPrune={handlePrune}
                                    />

                                    <ConceptDriftMonitor />
                                </div>

                                {/* Right Side: Summary & Actions */}
                                <div className="space-y-6">
                                    {/* Item Stats Card */}
                                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Métricas de Validez</h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Precisión</p>
                                                <p className="text-xl font-bold text-white">{Math.round(detail.accuracy_rate)}%</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Drift Index</p>
                                                <p className="text-xl font-bold text-amber-500">0.12</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Total Respuestas</span>
                                                <span className="text-white font-mono">{detail.total_responses}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Status Teórico</span>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">CALIBRADO</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Recomendaciones</h4>

                                        <div className="space-y-3">
                                            {detail.distractors.some(d => d.is_useless) && (
                                                <div className="flex gap-3 text-xs">
                                                    <Scissors className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                                        Se detectaron distractores inútiles. La poda reducirá la carga cognitiva sin afectar la precisión.
                                                    </p>
                                                </div>
                                            )}
                                            {detail.distractors.some(d => d.is_critical) && (
                                                <div className="flex gap-3 text-xs">
                                                    <BrainCircuit className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                                        Hay ambigüedad crítica. Vincule el distractor popular a un Nodo Sombra para capturar la duda.
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex gap-3 text-xs">
                                                <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                <p className="text-slate-400 text-[11px] leading-relaxed">
                                                    El ítem mantiene buena discriminación. No se requiere recalibración de parámetros Slip.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-[#1A1A1A] border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all text-slate-300"
                    >
                        Cerrar Auditoría
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
