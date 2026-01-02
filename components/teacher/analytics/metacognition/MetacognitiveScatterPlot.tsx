'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MetacognitiveStudent } from '@/lib/actions/teacher/metacognitive-actions';

interface MetacognitiveScatterPlotProps {
    students: MetacognitiveStudent[];
    className?: string;
}

export const MetacognitiveScatterPlot: React.FC<MetacognitiveScatterPlotProps> = ({ students, className }) => {
    const [hoveredStudent, setHoveredStudent] = useState<MetacognitiveStudent | null>(null);

    const getArchetypeColor = (archetype: string) => {
        switch (archetype) {
            case 'CALIBRATED': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
            case 'DELUSIONAL': return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'; // Avatar Glow effect
            case 'UNCERTAIN': return 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]';
            default: return 'bg-zinc-500';
        }
    };

    return (
        <div className={cn("relative w-full aspect-square bg-[#252525]/30 border border-white/5 rounded-2xl overflow-hidden", className)}>
            {/* Quadrant Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-[1px] bg-white/10" />
                <div className="absolute w-[1px] h-full bg-white/10" />
            </div>

            {/* Quadrant Labels */}
            <div className="absolute top-4 right-4 text-[10px] text-rose-400 font-black uppercase tracking-widest opacity-40">Delirantes (Sobreconfianza)</div>
            <div className="absolute top-4 left-4 text-[10px] text-zinc-600 font-black uppercase tracking-widest opacity-40">Ruido Cognitivo</div>
            <div className="absolute bottom-4 left-4 text-[10px] text-indigo-400 font-black uppercase tracking-widest opacity-40">Inseguros (Bajo-confianza)</div>
            <div className="absolute bottom-4 right-4 text-[10px] text-emerald-400 font-black uppercase tracking-widest opacity-40">Maestría Calibrada</div>

            {/* Axis Labels */}
            <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                Precisión Real →
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold -rotate-90">
                ← Certeza Reportada
            </div>

            {/* Student Points */}
            <div className="absolute inset-0 p-8">
                {students.map((student, idx) => (
                    <motion.div
                        key={`${student.studentId}-${idx}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.5, zIndex: 10 }}
                        className={cn(
                            "absolute w-4 h-4 rounded-full cursor-help transition-all duration-300",
                            getArchetypeColor(student.archetype),
                            student.archetype === 'DELUSIONAL' ? 'ring-2 ring-rose-500/50 ring-offset-2 ring-offset-[#1A1A1A]' : ''
                        )}
                        style={{
                            left: `${student.accuracy * 100}%`,
                            bottom: `${student.certainty * 100}%`,
                            transform: 'translate(-50%, 50%)'
                        }}
                        onMouseEnter={() => setHoveredStudent(student)}
                        onMouseLeave={() => setHoveredStudent(null)}
                    />
                ))}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredStudent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-20 pointer-events-none bg-[#1A1A1A]/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]"
                        style={{
                            left: `${hoveredStudent.accuracy * 100}%`,
                            bottom: `${hoveredStudent.certainty * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Perfil Metacognitivo</span>
                                <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                    hoveredStudent.archetype === 'CALIBRATED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        hoveredStudent.archetype === 'DELUSIONAL' ? 'bg-rose-500/10 text-rose-500' :
                                            'bg-indigo-500/10 text-indigo-500'
                                )}>
                                    {hoveredStudent.archetype}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Precisión</div>
                                    <div className="text-lg font-mono text-white leading-none">{Math.round(hoveredStudent.accuracy * 100)}%</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Certeza</div>
                                    <div className="text-lg font-mono text-white leading-none">{Math.round(hoveredStudent.certainty * 100)}%</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                <span className="material-symbols-outlined text-xs text-rose-400">psychology_alt</span>
                                <span className="text-[10px] text-zinc-400">
                                    {hoveredStudent.blindSpots} Puntos Ciegos detectados
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
