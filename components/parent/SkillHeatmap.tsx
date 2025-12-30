'use client';

import { motion } from 'framer-motion';

export interface HeatmapItem {
    name: string;
    percentage: number;
    color: string;
    description: string;
}

interface SkillHeatmapProps {
    skills: HeatmapItem[];
}

const BLOOM_TOOLTIPS: Record<string, string> = {
    'Recordar': 'Capacidad de recuperar información relevante de la memoria a largo plazo.',
    'Comprender': 'Habilidad para determinar el significado de mensajes instruccionales.',
    'Aplicar': 'Uso diario de procedimientos en situaciones artísticas reales.',
    'Analizar': 'Desglose del material en sus partes constituyentes y detección de relaciones.',
    'Evaluar': 'Emisión de juicios basados en criterios y estándares de calidad.',
    'Crear': 'Reunir elementos para formar un todo coherente o funcional; generar ideas nuevas.'
};

export default function SkillHeatmap({ skills }: SkillHeatmapProps) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover/card:bg-neon-violet/10 transition-all duration-700" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="material-symbols-outlined text-neon-violet">insights</span>
                        Métricas de Dominio
                    </h3>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Taxonomía de Bloom</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative group p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-neon-violet/30 transition-all cursor-help"
                        >
                            {/* Hover info tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 bg-neutral-900 border border-white/10 rounded-xl text-[10px] text-gray-400 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl backdrop-blur-xl">
                                {BLOOM_TOOLTIPS[skill.name] || skill.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-neutral-900" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-all">
                                    <span className="text-2xl font-black italic tracking-tighter" style={{ color: skill.color }}>
                                        {skill.percentage}
                                    </span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">{skill.name}</p>

                                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.percentage}%` }}
                                        transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: skill.color }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
