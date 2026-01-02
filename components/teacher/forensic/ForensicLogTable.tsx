"use client";

import { useState } from "react";
import { ForensicQuestionData } from "@/lib/actions/teacher/forensic-actions";

interface ForensicLogTableProps {
    questions: ForensicQuestionData[];
}

export function ForensicLogTable({ questions }: ForensicLogTableProps) {
    const [expandedReason, setExpandedReason] = useState<string | null>(null);

    const toggleReason = (questionId: string) => {
        setExpandedReason(expandedReason === questionId ? null : questionId);
    };

    return (
        <div className="overflow-x-auto rounded-lg border border-[#333] bg-[#252525]">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#1A1A1A] text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-medium">Pregunta / Competencia</th>
                        <th className="px-6 py-4 font-medium text-center">RTE</th>
                        <th className="px-6 py-4 font-medium text-center">Hesitación ($H_i$)</th>
                        <th className="px-6 py-4 font-medium text-center">Seguridad (CBM)</th>
                        <th className="px-6 py-4 font-medium">Veredicto Clínico</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                    {questions.map((q) => {
                        // Toxic Doubt Detection: Hi > 2.0 AND incorrect answer
                        const isToxicDoubt = q.telemetry.hesitationIndex > 2.0 && !q.isCorrect;

                        // Row-level warning state for rapid guessing
                        const rowWarningClass = q.telemetry.isRapidGuessing
                            ? 'bg-red-500/5 border-l-4 border-l-red-500/50'
                            : '';

                        return (
                            <tr
                                key={q.questionId}
                                className={`hover:bg-[#2A2A2A] transition-colors ${rowWarningClass}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white truncate max-w-xs">{q.stem}</span>
                                        <span className="text-xs text-gray-500 font-mono">ID: {q.questionId.split('-')[0]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-lg font-mono font-bold ${q.telemetry.isRapidGuessing ? 'text-red-400' : 'text-blue-400'}`}>
                                            {q.telemetry.rte.toFixed(2)}
                                        </span>
                                        {q.telemetry.isRapidGuessing && (
                                            <span
                                                className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase tracking-wider cursor-help"
                                                title="Regla NT10: Tiempo < 30% del esperado. Esta respuesta no constituye evidencia válida."
                                            >
                                                ADIVINANZA RÁPIDA
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`text-lg font-mono font-bold ${q.telemetry.hesitationIndex > 2 ? 'text-amber-400' : 'text-gray-400'}`}>
                                            {q.telemetry.hesitationIndex.toFixed(1)}
                                        </span>
                                        {isToxicDoubt ? (
                                            <span className="text-[10px] bg-gradient-to-r from-amber-900/30 to-red-900/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
                                                DUDA TÓXICA
                                            </span>
                                        ) : q.telemetry.hesitationIndex > 2 ? (
                                            <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">
                                                VOLATILIDAD ALTA
                                            </span>
                                        ) : null}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${q.confidence === 'HIGH' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' :
                                            q.confidence === 'MEDIUM' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' :
                                                'bg-gray-800 text-gray-400 border-gray-700'
                                        }`}>
                                        {q.confidence}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${q.diagnosis.state === 'MASTERED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    q.diagnosis.state === 'MISCONCEPTION' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {q.diagnosis.state}
                                            </span>
                                            <span className={`material-symbols-outlined text-sm ${q.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {q.isCorrect ? 'check_circle' : 'cancel'}
                                            </span>
                                        </div>

                                        {/* Clickable Reason */}
                                        <button
                                            onClick={() => toggleReason(q.questionId)}
                                            className="text-left text-xs text-gray-400 italic leading-relaxed hover:text-emerald-400 transition-colors cursor-pointer flex items-start gap-2 group"
                                        >
                                            <span className="material-symbols-outlined text-xs mt-0.5 opacity-50 group-hover:opacity-100">
                                                {expandedReason === q.questionId ? 'expand_less' : 'expand_more'}
                                            </span>
                                            <span className="flex-1">
                                                "{q.diagnosis.reason}"
                                            </span>
                                        </button>

                                        {/* Expanded Reason Detail */}
                                        {expandedReason === q.questionId && (
                                            <div className="mt-2 p-3 bg-black/20 rounded-lg border border-emerald-500/10 text-xs space-y-2 animate-in fade-in duration-200">
                                                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-sm">biotech</span>
                                                    Análisis Forense
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {q.diagnosis.reason}
                                                </p>
                                                {isToxicDoubt && (
                                                    <div className="pt-2 border-t border-amber-500/20">
                                                        <p className="text-amber-300 text-[11px] font-bold">
                                                            ⚠️ Nodo Sombra Detectado: Un modelo mental defectuoso está compitiendo activamente con el conocimiento correcto.
                                                        </p>
                                                    </div>
                                                )}
                                                {q.telemetry.isRapidGuessing && (
                                                    <div className="pt-2 border-t border-red-500/20">
                                                        <p className="text-red-300 text-[11px] font-bold">
                                                            🚫 Evidencia Inválida (NT10): Esta respuesta no se considera en el cálculo de competencia debido a tiempo insuficiente de procesamiento.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
