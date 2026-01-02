'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CalibrationGapGaugeProps {
    gapValue: number; // 0-100 (percentage)
    className?: string;
}

export const CalibrationGapGauge: React.FC<CalibrationGapGaugeProps> = ({ gapValue, className }) => {
    // Definir nivel de riesgo clínico
    const isHighRisk = gapValue > 15;
    const isCritical = gapValue > 25;

    const angle = (gapValue / 100) * 180; // Mapeo a semicírculo

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <div className="relative w-48 h-24 overflow-hidden">
                {/* Gauge Background */}
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-white/5" />

                {/* Gauge Active Segment */}
                <motion.div
                    initial={{ rotate: -180 }}
                    animate={{ rotate: -180 + angle }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                        "absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent border-t-current origin-center",
                        isCritical ? "text-rose-500" : isHighRisk ? "text-amber-500" : "text-emerald-500"
                    )}
                    style={{ borderLeftColor: 'currentColor' }}
                />

                {/* Center Value */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {gapValue.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                        Brecha Media
                    </span>
                </div>
            </div>

            {/* Risk Badge */}
            <div className={cn(
                "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                isCritical ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                    isHighRisk ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            )}>
                <span className="material-symbols-outlined text-xs">
                    {isHighRisk ? 'warning' : 'check_circle'}
                </span>
                {isCritical ? 'Descalibración Crítica' : isHighRisk ? 'Riesgo de Inconsistencia' : 'Cohorte Calibrada'}
            </div>

            <p className="text-[10px] text-zinc-500 italic text-center leading-relaxed max-w-[180px]">
                La brecha mide la distancia promedio entre el conocimiento percibido y el real.
            </p>
        </div>
    );
};
