import React from 'react';
import { Lightbulb, BookOpen, Quote } from 'lucide-react';
import { CohortAnalytics } from '@/lib/actions/admin/admin-analytics-actions';

interface CatedraRecommendationProps {
    data: CohortAnalytics;
}

export const CatedraRecommendation: React.FC<CatedraRecommendationProps> = ({ data }) => {
    const totalStudents = data.heatMap.length;
    const maxRisk = data.kpis.maxRiskConcept;

    if (!maxRisk || totalStudents === 0) return null;

    const bugPercentage = Math.round((maxRisk.bugCount / totalStudents) * 100);

    return (
        <div className="bg-[#1e1e1e] border-l-4 border-rose-500 p-8 rounded-r-xl shadow-xl mt-8 mb-12">
            <div className="flex items-start gap-6">
                <div className="bg-rose-500/10 p-4 rounded-2xl shadow-inner border border-rose-500/20">
                    <Lightbulb className="text-rose-500" size={32} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">Prioridad Alta</span>
                        <h2 className="text-xl font-bold text-white tracking-tight">Recomendación de Cátedra Presencial</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <p className="text-zinc-400 leading-relaxed mb-6 text-sm">
                                Basado en el análisis de cohorte, el <span className="text-rose-400 font-bold underline decoration-rose-500/30 underline-offset-4">{bugPercentage}% de tus estudiantes</span> exhibe una descalibración crítica en el concepto:
                                <span className="text-white font-semibold"> "{maxRisk.title}"</span>.
                            </p>

                            <div className="flex items-start gap-4 p-4 bg-zinc-800/40 rounded-lg border border-zinc-800">
                                <Quote className="text-zinc-600 shrink-0 rotate-180" size={20} />
                                <p className="text-zinc-300 text-sm leading-relaxed italic">
                                    "La mayoría identifica correctamente el proceso inicial, pero falla al aplicar la regla de transformación lineal. Esto sugiere un malentendido de 'Prerrequisito Incompleto'."
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-2">
                                <BookOpen size={14} /> Acciones Sugeridas para mañana
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-zinc-400">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Iniciar la sesión con un contraejemplo del bug detectado.</span>
                                </li>
                                <li className="flex gap-3 text-sm text-zinc-400">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Dividir el grupo en duplas Estudiante-Maestro (Matching de Calibración).</span>
                                </li>
                                <li className="flex gap-3 text-sm text-zinc-400">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Reforzar el recurso #322 del Blueprint de Facultad.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
