"use client";

import { useState, useEffect } from "react";
import { getForensicSessionBreakdown, ForensicSessionBreakdown } from "@/lib/actions/teacher/forensic-actions";
import { ForensicLogTable } from "./ForensicLogTable";
import { EvidenceQualityMatrix } from "./EvidenceQualityMatrix";
import { RemediationJustificationPanel } from "./RemediationJustificationPanel";

interface SessionForensicViewProps {
    attemptId: string;
    onClose?: () => void;
}

export function SessionForensicView({ attemptId, onClose }: SessionForensicViewProps) {
    const [data, setData] = useState<ForensicSessionBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'log' | 'evidence' | 'remediation'>('log');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const result = await getForensicSessionBreakdown(attemptId);
            setData(result);
            setLoading(false);
        }
        loadData();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-[#1A1A1A] rounded-xl border border-[#333]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Iniciando Análisis Forense...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 bg-[#1A1A1A] rounded-xl border border-[#333] text-center">
                <span className="material-symbols-outlined text-4xl text-gray-600 mb-4">error_outline</span>
                <p className="text-gray-400">No se pudo recuperar la telemetría de esta sesión.</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-[#252525] text-white rounded hover:bg-[#333] transition-colors"
                    >
                        Cerrar
                    </button>
                )}
            </div>
        );
    }

    const avgRte = data.questions.reduce((acc, q) => acc + q.telemetry.rte, 0) / data.questions.length;
    const rapidGuessCount = data.questions.filter(q => q.telemetry.isRapidGuessing).length;

    return (
        <div className="flex flex-col gap-6 bg-[#1A1A1A] p-6 rounded-xl border border-[#333] shadow-2xl max-w-6xl mx-auto overflow-hidden">
            {/* Header: Salud de la Sesión */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#333]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#252525] rounded-lg border border-[#333]">
                        <span className="material-symbols-outlined text-3xl text-emerald-500">biotech</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Desglose Forense de la Sesión</h2>
                        <p className="text-xs text-gray-500 font-mono">ATTEMPT_ID: {data.attemptId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">RTE Promedio</span>
                        <span className={`text-xl font-mono ${avgRte < 0.3 ? 'text-red-400' : 'text-emerald-400'}`}>{avgRte.toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-[#333]"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Calidad Evidencia</span>
                        <span className="text-xl font-mono text-blue-400">
                            {Math.round(((data.questions.length - rapidGuessCount) / data.questions.length) * 100)}%
                        </span>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-4 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-soft">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#333]">
                <button
                    onClick={() => setActiveTab('log')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'log' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Bitácora Forense
                </button>
                <button
                    onClick={() => setActiveTab('evidence')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'evidence' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Análisis de Evidencia
                </button>
                <button
                    onClick={() => setActiveTab('remediation')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'remediation' ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    Auditoría de Remediación
                </button>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'log' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2">
                            <span>Historial de Decisiones y Micro-latencias</span>
                            <span className="text-emerald-500/70">Caja Blanca: ON</span>
                        </div>
                        <ForensicLogTable questions={data.questions} />
                    </div>
                )}

                {activeTab === 'evidence' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2">
                            <span>Matriz de Calibración Cognitiva</span>
                            <span className="text-amber-500/70">Detección de Patologías Activa</span>
                        </div>
                        <EvidenceQualityMatrix questions={data.questions} />

                        {/* Summary Legend */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#333]">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">info</span>
                                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                    <strong className="text-white block mb-1">Diagnóstico Clínico:</strong>
                                    Basado en el cruce de aciertos, seguridad reportada y tiempo de respuesta para descartar ruido.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 text-sm">waves</span>
                                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                    <strong className="text-white block mb-1">Firma de Hesitación:</strong>
                                    Una volatilidad alta ($H_i &gt; 2$) en respuestas incorrectas confirma un modelo mental en conflicto.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-sm">security_update_warning</span>
                                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                    <strong className="text-white block mb-1">Veredicto Forense:</strong>
                                    Las respuestas marcadas como "Evidencia Inválida" no penalizan al alumno, sino que se tratan como ruido (NA).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'remediation' && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <RemediationJustificationPanel attemptId={attemptId} />
                    </div>
                )}
            </div>
        </div>
    );
}
