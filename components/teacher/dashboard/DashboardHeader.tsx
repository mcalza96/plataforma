import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface DashboardHeaderProps {
    student: {
        display_name: string;
        avatar_url?: string;
    };
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const DashboardHeader = ({ student }: DashboardHeaderProps) => (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-8">
            <div className="relative w-28 h-28 p-1 rounded-[2.5rem] bg-gradient-to-br from-primary to-neon-violet shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-neutral-900 border-2 border-black/20">
                    <OptimizedImage
                        src={student.avatar_url || ''}
                        alt={student.display_name}
                        fill
                        className="object-cover"
                        fallbackIcon="person"
                    />
                </div>
            </div>
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Centro de Inteligencia</span>
                    <div className="h-px w-8 bg-rose-500/20" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Gestión Táctica</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
                    {student.display_name}
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                        <span className="material-symbols-outlined text-sm text-rose-500">monitoring</span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Enlace Neuronal Activo</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado del Sistema</span>
            <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">Motor de Inferencia Operativo</span>
            </div>
        </div>
    </motion.div>
);
