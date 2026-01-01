import React from 'react';
import { ShieldAlert, Target, Zap } from 'lucide-react';

interface AuditKPIsProps {
    kpis: {
        frictionIndex: number;
        maxRiskConcept: { id: string; title: string; bugCount: number } | null;
        averageECE: number;
    };
    totalStudents: number;
}

export const AuditKPIs: React.FC<AuditKPIsProps> = ({ kpis, totalStudents }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* KPI: Friction Index */}
            <div className="bg-[#252525] border border-zinc-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert size={80} className="text-rose-500" />
                </div>
                <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-medium mb-1">Índice de Fricción Global</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-rose-500">{kpis.frictionIndex}%</span>
                        <span className="text-zinc-500 text-xs">de la cohorte</span>
                    </div>
                    <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Requiere Intervención Crítica
                    </p>
                </div>
            </div>

            {/* KPI: Max Risk Concept */}
            <div className="bg-[#252525] border border-zinc-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={80} className="text-amber-500" />
                </div>
                <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-medium mb-1">Concepto de Máximo Riesgo</p>
                    {kpis.maxRiskConcept ? (
                        <>
                            <div className="text-xl font-bold text-white truncate max-w-[80%]">
                                {kpis.maxRiskConcept.title}
                            </div>
                            <p className="text-amber-500 text-sm font-semibold mt-1">
                                {kpis.maxRiskConcept.bugCount} estudiantes infectados
                            </p>
                        </>
                    ) : (
                        <div className="text-xl font-bold text-emerald-500">Sin riesgos críticos</div>
                    )}
                    <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest font-semibold">Punto de Fricción Principal</p>
                </div>
            </div>

            {/* KPI: Calibration (ECE) */}
            <div className="bg-[#252525] border border-zinc-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={80} className="text-sky-500" />
                </div>
                <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-medium mb-1">Calibración Promedio (ECE)</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${kpis.averageECE > 20 ? 'text-rose-400' : 'text-sky-400'}`}>
                            {kpis.averageECE}
                        </span>
                        <span className="text-zinc-500 text-xs">puntos de desvío</span>
                    </div>
                    <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest font-semibold">
                        {kpis.averageECE <= 15 ? 'Alta alineación cognitiva' : 'Desalineación metacognitiva'}
                    </p>
                </div>
            </div>
        </div>
    );
};
