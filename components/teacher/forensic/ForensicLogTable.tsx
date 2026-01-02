"use client";

import { ForensicQuestionData } from "@/lib/actions/teacher/forensic-actions";

interface ForensicLogTableProps {
    questions: ForensicQuestionData[];
}

export function ForensicLogTable({ questions }: ForensicLogTableProps) {
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
                    {questions.map((q) => (
                        <tr key={q.questionId} className="hover:bg-[#2A2A2A] transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-white truncate max-w-xs">{q.stem}</span>
                                    <span className="text-xs text-gray-500">ID: {q.questionId.split('-')[0]}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`text-lg font-mono ${q.telemetry.isRapidGuessing ? 'text-red-400' : 'text-blue-400'}`}>
                                        {q.telemetry.rte.toFixed(2)}
                                    </span>
                                    {q.telemetry.isRapidGuessing && (
                                        <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                                            RAPID GUESSING
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`text-lg font-mono ${q.telemetry.hesitationIndex > 2 ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                                        {q.telemetry.hesitationIndex.toFixed(1)}
                                    </span>
                                    {q.telemetry.hesitationIndex > 2 && (
                                        <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                                            VOLATILIDAD ALTA
                                        </span>
                                    )}
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
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${q.diagnosis.state === 'MASTERED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                q.diagnosis.state === 'MISCONCEPTION' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {q.diagnosis.state}
                                        </span>
                                        <span className={`material-symbols-outlined text-sm ${q.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {q.isCorrect ? 'check_circle' : 'cancel'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic leading-relaxed">
                                        "{q.diagnosis.reason}"
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
