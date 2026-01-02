'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMetacognitiveAnalytics, MetacognitiveAnalytics } from '@/lib/actions/teacher/metacognitive-actions';
import { MetacognitiveScatterPlot } from './MetacognitiveScatterPlot';
import { CalibrationGapGauge } from './CalibrationGapGauge';
import { TacticalRecommendationPanel } from './TacticalRecommendationPanel';

interface MetacognitiveMirrorProps {
    examId?: string;
}

export const MetacognitiveMirror: React.FC<MetacognitiveMirrorProps> = ({ examId }) => {
    const [data, setData] = useState<MetacognitiveAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const res = await getMetacognitiveAnalytics(examId);
            setData(res);
            setLoading(false);
        }
        fetchData();
    }, [examId]);

    if (loading) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-[#1A1A1A] rounded-3xl border border-white/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin" />
                    <p className="text-zinc-500 font-black text-xs uppercase tracking-widest">Sincronizando Espejo Metacognitivo...</p>
                </div>
            </div>
        );
    }

    if (!data || data.students.length === 0) {
        return (
            <div className="w-full p-12 text-center bg-[#1A1A1A] rounded-3xl border border-dashed border-white/10">
                <span className="material-symbols-outlined text-4xl text-zinc-800 mb-4">psychology</span>
                <p className="text-zinc-500 italic text-sm">No hay suficientes datos de calibración para generar el espejo.</p>
                <p className="text-zinc-700 text-[10px] uppercase font-bold mt-2 tracking-widest">Se requieren intentos de examen completados con CBM activo.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Scatter Plot - 2/3 width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-4"
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-500">face_retouching_natural</span>
                            Espejo Metacognitivo
                        </h2>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Mapa de Alineación Certeza vs Competencia</p>
                    </div>
                </div>

                <MetacognitiveScatterPlot students={data.students} />

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-black mb-1">Muestra de Cohorte</div>
                        <div className="text-xl font-mono text-white font-black">{data.students.length} <span className="text-[10px] text-zinc-600">Alumnos</span></div>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-black mb-1">Conflictos Críticos</div>
                        <div className="text-xl font-mono text-rose-500 font-black">{data.criticalBlindSpotsCount} <span className="text-[10px] text-zinc-600">Puntos Ciegos</span></div>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-xl border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase font-black mb-1">Nivel de Calibración</div>
                        <div className="text-xl font-mono text-emerald-500 font-black">
                            {data.students.filter(s => s.archetype === 'CALIBRATED').length} <span className="text-[10px] text-zinc-600">Maduros</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Sidebar with Gauge and Recommendations - 1/3 width */}
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#1A1A1A] p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center shadow-2xl"
                >
                    <CalibrationGapGauge gapValue={data.cohortAverageGap * 100} />
                </motion.div>

                <TacticalRecommendationPanel recommendations={data.recommendations} />
            </div>
        </div>
    );
};
