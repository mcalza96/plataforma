"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ImpactRatioGaugeProps {
    ratio: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export default function ImpactRatioGauge({ ratio, status }: ImpactRatioGaugeProps) {
    const percentage = Math.min(Math.round(ratio * 100), 150);

    const getColor = () => {
        if (status === 'OPTIMAL') return 'text-emerald-400';
        if (status === 'WARNING') return 'text-amber-400';
        return 'text-rose-400';
    };

    const getBgColor = () => {
        if (status === 'OPTIMAL') return 'bg-emerald-500/10';
        if (status === 'WARNING') return 'bg-amber-500/10';
        return 'bg-rose-500/10';
    };

    return (
        <div className={`p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden ${getBgColor()}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={`h-full ${status === 'OPTIMAL' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
            </div>

            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Disparate Impact Ratio (4/5 Rule)
            </h4>

            <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * Math.min(ratio, 1)) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={getColor()}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${getColor()}`}>{percentage}%</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Equity Score</span>
                </div>
            </div>

            <div className="text-center space-y-1">
                <p className={`text-sm font-bold ${getColor()}`}>
                    {status === 'OPTIMAL' ? 'Paridad Alcanzada' : status === 'WARNING' ? 'Sesgo Potencial' : 'Violación de Equidad'}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
                    {ratio < 0.8
                        ? 'El grupo menos favorecido recibe < 80% de las intervenciones del grupo base.'
                        : 'La distribución de remediaciones cumple con los estándares éticos.'}
                </p>
            </div>
        </div>
    );
}
