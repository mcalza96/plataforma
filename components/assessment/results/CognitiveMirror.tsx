'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalibrationMetrics } from '@/lib/domain/assessment';
import { AlertTriangle, ShieldCheck, Target, Zap } from 'lucide-react';

interface CognitiveMirrorProps {
    calibration: CalibrationMetrics;
}

export const CognitiveMirror: React.FC<CognitiveMirrorProps> = ({ calibration }) => {
    const { certaintyAverage, accuracyAverage, blindSpots, fragileKnowledge } = calibration;

    // Difference determines if the student is overconfident or underconfident
    const calibrationGap = certaintyAverage - accuracyAverage;
    const isOverconfident = calibrationGap > 15;
    const isUnderconfident = calibrationGap < -15;

    return (
        <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden relative group">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Visual Gauge */}
                <div className="relative w-48 h-48 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        {/* Track */}
                        <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-800" />

                        {/* Accuracy (Inner) */}
                        <motion.circle
                            cx="96" cy="96" r="65" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                            className="text-emerald-500/30"
                            initial={{ strokeDasharray: "0 1000" }}
                            animate={{ strokeDasharray: `${(accuracyAverage / 100) * 408} 1000` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />

                        {/* Certainty (Outer) */}
                        <motion.circle
                            cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
                            className={isOverconfident ? "text-amber-500" : "text-indigo-500"}
                            initial={{ strokeDasharray: "0 1000" }}
                            animate={{ strokeDasharray: `${(certaintyAverage / 100) * 502} 1000` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{accuracyAverage}%</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Precisión Real</span>
                    </div>
                </div>

                {/* Analysis Text */}
                <div className="flex-1 space-y-6">
                    <header>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            Calibración Metacognitiva
                            {isOverconfident ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">Desajuste: +{Math.round(calibrationGap)}%</span>
                            ) : isUnderconfident ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">Desajuste: {Math.round(calibrationGap)}%</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">ECE Nominal</span>
                            )}
                        </h2>
                        <p className="text-sm text-slate-400">
                            Análisis vectorial de <span className="text-indigo-400 font-bold">Certeza Subjetiva</span> vs <span className="text-emerald-400 font-bold">Precisión Empírica</span>.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Blind Spots Indicator */}
                        <div className={`p-4 rounded-2xl border ${blindSpots > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-slate-950/20 border-slate-800"}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <Target className={`w-4 h-4 ${blindSpots > 0 ? "text-amber-500" : "text-slate-600"}`} />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Puntos Ciegos</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${blindSpots > 0 ? "text-amber-500" : "text-slate-700"}`}>{blindSpots}</span>
                                <span className="text-[10px] text-slate-500">Errores con alta seguridad</span>
                            </div>
                        </div>

                        {/* Fragile Knowledge Indicator */}
                        <div className={`p-4 rounded-2xl border ${fragileKnowledge > 0 ? "bg-indigo-500/5 border-indigo-500/20" : "bg-slate-950/20 border-slate-800"}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className={`w-4 h-4 ${fragileKnowledge > 0 ? "text-indigo-500" : "text-slate-600"}`} />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Conocimiento Frágil</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${fragileKnowledge > 0 ? "text-indigo-400" : "text-slate-700"}`}>{fragileKnowledge}</span>
                                <span className="text-[10px] text-slate-500">Aciertos con duda</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta-Feedback Message */}
                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                        {isOverconfident ? (
                            <div className="flex gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                                <p className="text-sm text-amber-200/80 leading-relaxed italic">
                                    "Alerta de <span className="font-black">Punto Ciego</span>: Tu alta seguridad en respuestas incorrectas indica un modelo mental defectuoso. Debemos resetear este concepto antes de que se consolide erróneamente."
                                </p>
                            </div>
                        ) : isUnderconfident ? (
                            <div className="flex gap-4">
                                <ShieldCheck className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-indigo-200/80 leading-relaxed italic">
                                    "Evidencia de <span className="font-black">Conocimiento Frágil</span>: Lograste aciertos, pero con baja seguridad. Esto sugiere que el concepto no está plenamente consolidado en tu memoria de largo plazo."
                                </p>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Target className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                                <p className="text-sm text-emerald-200/80 leading-relaxed italic">
                                    "Calibración Óptima: Existe una correlación lineal entre tu confianza y tu competencia real. Tu percepción metacognitiva es precisa."
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
