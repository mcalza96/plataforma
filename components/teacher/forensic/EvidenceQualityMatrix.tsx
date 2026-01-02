"use client";

import { ForensicQuestionData } from "@/lib/actions/teacher/forensic-actions";

interface EvidenceQualityMatrixProps {
    questions: ForensicQuestionData[];
}

export function EvidenceQualityMatrix({ questions }: EvidenceQualityMatrixProps) {
    const blindSpots = questions.filter(q => q.confidence === 'HIGH' && !q.isCorrect);
    const fragileKnowledge = questions.filter(q => (q.confidence === 'LOW' || q.confidence === 'MEDIUM') && q.isCorrect);
    const mastered = questions.filter(q => q.confidence === 'HIGH' && q.isCorrect);
    const recognizedGaps = questions.filter(q => q.confidence === 'LOW' && !q.isCorrect);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Punto Ciego: High Confidence + Failure */}
            <div className={`p-4 rounded-lg border bg-[#252525] transition-all ${blindSpots.length > 0 ? 'border-red-500/50 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]' : 'border-[#333]'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-400">psychology_alt</span>
                        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Puntos Ciegos</h3>
                    </div>
                    <span className="text-2xl font-mono text-red-500">{blindSpots.length}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Casos donde el alumno reportó alta seguridad pero falló. Indica modelos mentales defectuosos (Misconceptions) arraigados.
                </p>
                <div className="space-y-2">
                    {blindSpots.map(q => (
                        <div key={q.questionId} className="p-2 rounded bg-black/40 border border-red-500/10 text-[10px] text-red-200">
                            {q.stem.substring(0, 60)}...
                        </div>
                    ))}
                    {blindSpots.length === 0 && <p className="text-[10px] text-gray-600 italic">No se detectaron puntos ciegos críticos.</p>}
                </div>
            </div>

            {/* Conocimiento Frágil: Low Confidence + Success */}
            <div className={`p-4 rounded-lg border bg-[#252525] transition-all ${fragileKnowledge.length > 0 ? 'border-amber-500/50 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]' : 'border-[#333]'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">warning</span>
                        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Conocimiento Frágil</h3>
                    </div>
                    <span className="text-2xl font-mono text-amber-500">{fragileKnowledge.length}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Aciertos con baja confianza o duda excesiva. Requieren refuerzo para lograr automaticidad y reducir el costo cognitivo.
                </p>
                <div className="space-y-2">
                    {fragileKnowledge.map(q => (
                        <div key={q.questionId} className="p-2 rounded bg-black/40 border border-amber-500/10 text-[10px] text-amber-200">
                            {q.stem.substring(0, 60)}...
                        </div>
                    ))}
                    {fragileKnowledge.length === 0 && <p className="text-[10px] text-gray-600 italic">No se detectaron aciertos frágiles.</p>}
                </div>
            </div>

            {/* Maestría Consolidada: High Confidence + Success */}
            <div className="p-4 rounded-lg border border-[#333] bg-[#252525]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <span className="material-symbols-outlined">verified</span>
                        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Maestría Fluida</h3>
                    </div>
                    <span className="text-2xl font-mono text-emerald-500">{mastered.length}</span>
                </div>
                <p className="text-[10px] text-gray-500">Evidencia sólida de competencia. El alumno sabe y sabe que sabe.</p>
            </div>

            {/* Gaps Reconocidos: Low Confidence + Failure */}
            <div className="p-4 rounded-lg border border-[#333] bg-[#252525]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                        <span className="material-symbols-outlined">help</span>
                        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Gaps Reconocidos</h3>
                    </div>
                    <span className="text-2xl font-mono text-blue-500">{recognizedGaps.length}</span>
                </div>
                <p className="text-[10px] text-gray-500">Ignorancia declarada. El alumno sabe que no sabe, lo cual es el primer paso para el aprendizaje.</p>
            </div>
        </div>
    );
}
