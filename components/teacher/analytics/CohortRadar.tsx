'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CohortMember } from '@/lib/actions/teacher/teacher-analytics-actions';
import { Target, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CohortRadarProps {
    members: CohortMember[];
    className?: string;
    onArchetypeSelect?: (archetype: string | null) => void;
}

/**
 * CohortRadar: Mapa de dispersión para visualizar inteligencia ejecutiva
 * X: Competencia (0-100)
 * Y: Calibración (ECE Score 0-100, 0 es mejor - Zona inferior)
 */
export const CohortRadar: React.FC<CohortRadarProps> = ({ members, className, onArchetypeSelect }) => {
    const [hoveredStudent, setHoveredStudent] = useState<CohortMember | null>(null);
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

    // Mapeo de colores por arquetipo (Forensic Palette)
    const archetypeColors: Record<string, string> = {
        'MASTER': 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        'DELUSIONAL': 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
        'UNCERTAIN': 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]',
        'DEVELOPING': 'bg-magenta-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
        'IMPULSIVE': 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    };

    const handleQuadrantClick = (archetype: string) => {
        const newValue = selectedArchetype === archetype ? null : archetype;
        setSelectedArchetype(newValue);
        if (onArchetypeSelect) onArchetypeSelect(newValue);
    };

    return (
        <div className={cn("bg-[#0F0F0F] p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-full relative overflow-hidden group", className)}>
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Radar de Arquetipos Forenses</h2>
                    </div>
                    <p className="text-[10px] text-zinc-500 max-w-xs font-medium">Analítica de precisión metacognitiva vs. dominio técnico.</p>
                </div>

                {/* Leyenda Interactiva */}
                <div className="flex flex-wrap gap-4">
                    {Object.entries(archetypeColors).map(([key, color]) => (
                        <button
                            key={key}
                            onClick={() => handleQuadrantClick(key)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95",
                                selectedArchetype === key
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-400"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full", color.split(' ')[0])}></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{key}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Espacio del Radar */}
            <div className="relative flex-1 w-full min-h-[500px] border border-white/5 rounded-[2rem] overflow-hidden bg-black/40 backdrop-blur-sm">
                {/* Cuadrantes con Labels Pedagógicos */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4">
                    {/* Top Left: DELUSIONAL / OVERCONFIDENT */}
                    <div
                        onClick={() => handleQuadrantClick('DELUSIONAL')}
                        className={cn("border-r border-b border-white/[0.03] p-6 cursor-pointer hover:bg-amber-500/[0.02] transition-colors relative group/q", selectedArchetype === 'DELUSIONAL' && "bg-amber-500/[0.04]")}
                    >
                        <div className="flex items-center gap-2 text-amber-500/30 group-hover/q:text-amber-500/60 transition-colors">
                            <AlertTriangle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Sesgo de Sobreestimación</span>
                        </div>
                    </div>
                    {/* Top Right: MASTER (High ECE?) No, MASTER should be bottom right (High Score, Low ECE) */}
                    {/* Realignment: Y axis 0 is bottom (perfect), 100 is top (high error) */}
                    <div
                        className={cn("border-b border-white/[0.03] p-6 relative group/q")}
                    >
                        <div className="flex items-center gap-2 text-zinc-800">
                            <span className="text-[10px] font-black uppercase tracking-tighter">Anomalía de Calibración</span>
                        </div>
                    </div>
                    {/* Bottom Left: AT RISK / DEVELOPING */}
                    <div
                        onClick={() => handleQuadrantClick('DEVELOPING')}
                        className={cn("border-r border-white/[0.03] p-6 cursor-pointer hover:bg-magenta-500/[0.02] transition-colors relative group/q", selectedArchetype === 'DEVELOPING' && "bg-magenta-500/[0.04]")}
                    >
                        <div className="flex items-center gap-2 text-magenta-500/30 group-hover/q:text-magenta-500/60 transition-colors">
                            <Zap size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">En Riesgo de Deserción</span>
                        </div>
                    </div>
                    {/* Bottom Right: MASTER */}
                    <div
                        onClick={() => handleQuadrantClick('MASTER')}
                        className={cn("p-6 cursor-pointer hover:bg-cyan-500/[0.02] transition-colors relative group/q", selectedArchetype === 'MASTER' && "bg-cyan-500/[0.04]")}
                    >
                        <div className="flex items-center gap-2 text-cyan-500/30 group-hover/q:text-cyan-500/60 transition-colors">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Zona de Maestría</span>
                        </div>
                    </div>
                </div>

                {/* Líneas de Ejes Principales */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-[80%] h-[1px] bg-white/10" />
                    <div className="absolute w-[1px] h-[80%] bg-white/10" />
                </div>

                {/* Etiquetas de Ejes */}
                <div className="absolute bottom-4 right-8 text-[9px] uppercase tracking-[0.2em] text-zinc-700 font-black italic">
                    DOMINIO TÉCNICO %
                </div>
                <div className="absolute top-8 left-6 text-[9px] uppercase tracking-[0.2em] text-zinc-700 font-black italic -rotate-90 origin-left">
                    DESCALIBRACIÓN (ECE)
                </div>

                {/* Puntos de Estudiantes */}
                <div className="absolute inset-0 px-4 py-4">
                    {members
                        .filter(m => !selectedArchetype || m.studentArchetype === selectedArchetype)
                        .map((member, idx) => (
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
                            className="absolute z-20 pointer-events-none bg-[#1A1A1A] border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[200px] backdrop-blur-xl"
                            style={{
                                left: `${memberToPos(hoveredStudent).x}%`,
                                bottom: `${hoveredStudent.eceScore * 100}%`,
                                transform: 'translate(-50%, -20px)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className={cn("size-2 rounded-full", archetypeColors[hoveredStudent.studentArchetype]?.split(' ')[0])} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">{hoveredStudent.studentArchetype}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end border-b border-white/5 pb-1">
                                    <span className="text-zinc-500 text-[9px] font-bold uppercase">Precisión</span>
                                    <span className="text-white font-mono text-sm leading-none">{Math.round(hoveredStudent.overallScore * 100)}%</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-white/5 pb-1">
                                    <span className="text-zinc-500 text-[9px] font-bold uppercase">Confianza</span>
                                    <span className="text-white font-mono text-sm leading-none">High (CBM)</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-500 text-[9px] font-bold uppercase">Índice ECE</span>
                                    <span className="text-amber-500 font-mono text-sm leading-none">{Math.round(hoveredStudent.eceScore * 100)}%</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                                <div className="size-6 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Target size={12} className="text-zinc-600" />
                                </div>
                                <span className="text-[8px] text-zinc-500 font-medium italic truncate">Haz clic para auditoría profunda</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend / Status bar */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-[9px] font-mono text-zinc-700 uppercase">Resumen de Calibración de Cátedra</p>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-600 text-[9px] font-black uppercase">Nivel Master:</span>
                        <span className="text-cyan-500 font-mono text-xs">{(members.filter(m => m.studentArchetype === 'MASTER').length / (members.length || 1) * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper para convertir datos a porcentaje de posición
const memberToPos = (member: CohortMember) => ({
    x: Math.max(5, Math.min(95, member.overallScore * 100)), // Evitar bordes
    y: Math.max(5, Math.min(95, member.eceScore * 100))
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
            whileHover={{ scale: 2, zIndex: 30 }}
            className={cn(
                "absolute w-3 h-3 rounded-full cursor-pointer transition-shadow duration-300 ring-4 ring-black/40",
                colorClass
            )}
            style={{
                left: `${pos.x}%`,
                bottom: `${pos.y}%`,
                transform: 'translate(-50%, 50%)'
            }}
            onMouseEnter={() => onHover(member)}
            onMouseLeave={onLeave}
        />
    );
};
