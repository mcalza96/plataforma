import React from 'react';
import { motion } from 'framer-motion';

interface ForensicAuditSectionProps {
    totalProjects: number;
    isSearching: boolean;
    onOpenForensic: () => void;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const ForensicAuditSection = ({ totalProjects, isSearching, onOpenForensic }: ForensicAuditSectionProps) => (
    <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-violet">museum</span>
                Evidencias de Desempeño y Auditoría
            </h3>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Modelos Mentales Detectados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {totalProjects > 0 ? (
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="group relative bg-[#1F1F1F] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden"
                >
                    <div className="aspect-video bg-neutral-900 overflow-hidden relative rounded-[2.2rem]">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                                onClick={onOpenForensic}
                                disabled={isSearching}
                                className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSearching ? 'Buscando...' : 'Revisar Auditoría Cognitiva Completa'}
                                <span className="material-symbols-outlined text-sm">open_in_full</span>
                            </button>
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                            <span className="px-4 py-1.5 bg-black/6 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">Snapshot de Calibración</span>
                        </div>
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                            <span className="material-symbols-outlined text-6xl">query_stats</span>
                        </div>
                    </div>
                    <div className="p-8">
                        <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Reporte Forense del Alumno</h4>
                        <p className="text-xs text-gray-500 mb-0 italic">Auditoría técnica de modelos mentales, sesgos cognitivos y brechas de aprendizaje identificadas.</p>
                    </div>
                </motion.div>
            ) : (
                <div className="col-span-full border-2 border-dashed border-white/5 p-16 rounded-[3rem] text-center bg-white/[0.01]">
                    <p className="text-gray-600 italic font-medium uppercase text-[10px] tracking-[0.2em]">No hay evidencias registradas en este cohorte.</p>
                </div>
            )}

            <div className="bg-surface-darker/30 rounded-[2.5rem] border border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center opacity-50">
                <span className="material-symbols-outlined text-4xl text-gray-700 mb-4">psychology_alt</span>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Detección de Sesgos Algorítmicos</p>
                <p className="text-[9px] text-gray-700 italic mt-2 italic">Análisis de consistencia interna en progreso...</p>
            </div>
        </div>
    </motion.div>
);
