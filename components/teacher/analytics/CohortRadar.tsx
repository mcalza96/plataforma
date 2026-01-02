'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CohortMember } from '@/lib/actions/teacher/teacher-analytics-actions';

interface CohortRadarProps {
    members: CohortMember[];
    className?: string;
}

/**
 * CohortRadar: Mapa de dispersión para visualizar inteligencia ejecutiva
 * X: Competencia (0-100)
 * Y: Calibración (ECE Score 0-100, 0 es mejor)
 */
export const CohortRadar: React.FC<CohortRadarProps> = ({ members, className }) => {
    const [hoveredStudent, setHoveredStudent] = useState<CohortMember | null>(null);

    // Mapeo de colores por arquetipo
    const archetypeColors: Record<string, string> = {
        'MASTER': 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
        'DELUSIONAL': 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        'UNCERTAIN': 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]',
        'DEVELOPING': 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]',
    };

    return (
        <div className={cn("bg-[#1A1A1A] p-6 rounded-xl border border-white/5 flex flex-col h-full", className)}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">Hub</span>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Cohort Radar</h2>
                </div>

                {/* Leyenda */}
                <div className="flex gap-4 text-[10px] text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5 line-clamp-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Master
                    </div>
                    <div className="flex items-center gap-1.5 line-clamp-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> Delusional
                    </div>
                    <div className="flex items-center gap-1.5 line-clamp-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Uncertain
                    </div>
                    <div className="flex items-center gap-1.5 line-clamp-1">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div> Developing
                    </div>
                </div>
            </div>

            {/* Espacio del Radar */}
            <div className="relative flex-1 w-full aspect-square md:aspect-auto min-h-[400px] border border-white/5 rounded-lg overflow-hidden bg-[#252525]/30">
                {/* Líneas de Cuadrantes */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-full h-[1px] bg-white/10" />
                    <div className="absolute w-[1px] h-full bg-white/10" />
                </div>

                {/* Etiquetas de Ejes */}
                <div className="absolute bottom-2 right-4 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                    Competencia →
                </div>
                <div className="absolute top-4 left-2 text-[10px] uppercase tracking-widest text-zinc-600 font-bold -rotate-90 origin-left whitespace-nowrap">
                    ← Descalibración
                </div>

                {/* Etiquetas de Cuadrantes */}
                <div className="absolute top-4 right-4 text-[10px] text-zinc-700 uppercase font-black">Puntos Ciegos</div>
                <div className="absolute top-4 left-4 text-[10px] text-zinc-700 uppercase font-black">Alto Riesgo</div>
                <div className="absolute bottom-4 left-4 text-[10px] text-zinc-700 uppercase font-black">Aprendizaje</div>
                <div className="absolute bottom-4 right-4 text-[10px] text-zinc-700 uppercase font-black">Zona de Maestría</div>

                {/* Puntos de Estudiantes */}
                <div className="absolute inset-0">
                    {members.map((member, idx) => (
                        <StudentPoint
                            key={`${member.studentId}-${idx}`}
                            member={member}
                            colorClass={archetypeColors[member.studentArchetype] || archetypeColors['DEVELOPING']}
                            onHover={setHoveredStudent}
                            onLeave={() => setHoveredStudent(null)}
                        />
                    ))}
                </div>

                {/* Tooltip con AnimatePresence */}
                <AnimatePresence>
                    {hoveredStudent && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute z-10 pointer-events-none bg-[#252525] border border-white/10 p-3 rounded-lg shadow-2xl min-w-[160px]"
                            style={{
                                left: `${memberToPos(hoveredStudent).x}%`,
                                top: `${memberToPos(hoveredStudent).y}%`,
                                transform: 'translate(-50%, -120%)'
                            }}
                        >
                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">ID: {hoveredStudent.studentId.slice(0, 8)}...</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 text-xs">Acierto:</span>
                                    <span className="text-white font-mono text-sm">{Math.round(hoveredStudent.overallScore * 100)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 text-xs">Error ECE:</span>
                                    <span className="text-white font-mono text-sm">{Math.round(hoveredStudent.eceScore * 100)}%</span>
                                </div>
                                <div className="mt-2 text-[10px] font-bold text-center py-1 rounded bg-white/5 text-zinc-300">
                                    {hoveredStudent.studentArchetype}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Helper para convertir datos a porcentaje de posición
const memberToPos = (member: CohortMember) => ({
    x: member.overallScore * 100, // 0-100
    y: 100 - (member.eceScore * 100) // Invertido: 0 descalibración arriba, 100 abajo? No, 0 alineación perfecta suele ser abajo en gráficos de error si queremos "subir".
    // Requisito dice: X: Score, Y: ECE. Típicamente ECE es "Error", así que a mayor ECE, más "arriba" (descalibrado).
    // Y: member.eceScore * 100 (0 es abajo, 100 es arriba)
});

const StudentPoint: React.FC<{
    member: CohortMember;
    colorClass: string;
    onHover: (m: CohortMember) => void;
    onLeave: () => void;
}> = ({ member, colorClass, onHover, onLeave }) => {
    const pos = memberToPos(member);

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.5, zIndex: 20 }}
            className={cn(
                "absolute w-3 h-3 rounded-full cursor-help transition-shadow duration-300",
                colorClass
            )}
            style={{
                left: `${pos.x}%`,
                bottom: `${member.eceScore * 100}%`, // ECE alto -> más arriba
                transform: 'translate(-50%, 50%)'
            }}
            onMouseEnter={() => onHover(member)}
            onMouseLeave={onLeave}
        />
    );
};
