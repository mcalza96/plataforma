'use client';

import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import StatCard from '@/components/ui/StatCard';
import SkillHeatmap, { HeatmapItem } from '@/components/teacher/SkillHeatmap';
import DeltaChart, { DeltaItem } from '@/components/teacher/DeltaChart';

interface TeacherDashboardViewProps {
    student: {
        id: string;
        display_name: string;
        level: number;
        avatar_url?: string;
    };
    stats: {
        totalProjects: number;
        hoursPracticed: number;
        completedLections: number;
        skills: HeatmapItem[];
    };
    feedback: any[];
    achievements: any[];
    knowledgeDelta: DeltaItem[];
    frontier: any[];
}

/**
 * TeacherDashboardView: Presentation layer for the institutional control center.
 * Professional nomenclature: Student/Teacher orchestration.
 */
export default function TeacherDashboardView({
    student,
    stats,
    feedback,
    achievements,
    knowledgeDelta,
    frontier
}: TeacherDashboardViewProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-7xl mx-auto w-full px-6 py-12"
        >
            {/* Header / Hero */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
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
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Seguimiento de Cátedra</span>
                            <div className="h-px w-8 bg-primary/20" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Gestión Académica</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
                            {student.display_name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="material-symbols-outlined text-sm text-primary">military_tech</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase">Nivel {student.level}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium italic">"Progresando hacia la maestría conceptual"</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        value={stats.hoursPracticed}
                        label="Horas de Vuelo"
                        icon="schedule"
                        variant="default"
                    />
                    <StatCard
                        value={stats.totalProjects}
                        label="Entregas"
                        icon="palette"
                        variant="default"
                    />
                    <StatCard
                        value={stats.completedLections}
                        label="Logros"
                        icon="trophy"
                        variant="primary"
                        className="hidden lg:block shrink-0"
                    />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Visual Data Deep Dive */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        <SkillHeatmap skills={stats.skills} />
                        <DeltaChart data={knowledgeDelta} />
                    </div>

                    {/* Learning Frontier */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">view_module</span>
                                Próximos Desafíos Cognitivos
                            </h3>
                            <span className="text-[10px] font-black text-primary/50 bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">Frontera de Aprendizaje</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {frontier.length > 0 ? frontier.map((node: any, idx: number) => (
                                <motion.div
                                    key={node.id}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="group relative bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/50 transition-all overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform blur-2xl" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Módulo Disponible</p>
                                        <h4 className="text-xl font-black text-white mb-2 leading-tight tracking-tight">{node.title_override || 'Fase de Construcción'}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 italic mb-6 leading-relaxed">
                                            {node.description_override || 'Este nodo ha sido liberado para su exploración pedagógica.'}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-700 text-sm">architecture</span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Orden: {node.order}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">rocket_launch</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-full border-2 border-dashed border-white/5 p-16 rounded-[3rem] text-center bg-white/[0.01]">
                                    <span className="material-symbols-outlined text-5xl text-gray-800 mb-4 animate-pulse">lock</span>
                                    <p className="text-gray-600 italic font-bold max-w-xs mx-auto text-sm">Toda la frontera actual ha sido explorada. El profesor está diseñando nuevos desafíos.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Museum of Evidence */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3 px-2">
                            <span className="material-symbols-outlined text-neon-violet">museum</span>
                            Galería de Evidencias
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {stats.totalProjects > 0 ? (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative bg-[#1F1F1F] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden"
                                >
                                    <div className="aspect-video bg-neutral-900 overflow-hidden relative rounded-[2.2rem]">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <button className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                                                Revisar Entrega
                                                <span className="material-symbols-outlined text-sm">open_in_full</span>
                                            </button>
                                        </div>
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="px-4 py-1.5 bg-black/6 backdrop-blur-md text-white text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest">Snapshot de Progreso</span>
                                        </div>
                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                            <span className="material-symbols-outlined text-6xl">palette</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Portafolio Institucional</h4>
                                        <p className="text-xs text-gray-500 mb-0 italic">Evidencia técnica de dominio capturada en tiempo real.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="col-span-full border-2 border-dashed border-white/5 p-12 rounded-[2.5rem] text-center">
                                    <p className="text-gray-600 italic font-medium uppercase text-[10px] tracking-[0.2em]">No hay entregas registradas en este periodo académico.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Vertical Sidebar: Feedback & Social Proof */}
                <motion.div variants={itemVariants} className="flex flex-col gap-12">
                    {/* Feedback Panel */}
                    <div className="bg-surface-darker/50 rounded-[3rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">chat_bubble</span>
                                Comunicación Pedagógica
                            </h3>
                        </div>

                        <div className="flex-1 max-h-[400px] overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {feedback.length > 0 ? feedback.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="relative pl-6 border-l-2 border-primary/20 hover:border-primary/50 transition-colors group/msg"
                                >
                                    <div className="absolute left-[-5px] top-0 size-2 rounded-full bg-primary/20 border border-primary/40 group-hover/msg:scale-125 group-hover/msg:bg-primary transition-all shadow-[0_0_10px_rgba(13,147,242,0.2)]"></div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{msg.sender_name}</p>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium mb-3 group-hover/msg:text-white transition-colors">
                                        "{msg.content}"
                                    </p>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                        {new Date(msg.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </p>
                                </motion.div>
                            )) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center opacity-30">
                                    <span className="material-symbols-outlined text-4xl mb-4">notifications_off</span>
                                    <p className="text-[10px] uppercase font-black tracking-widest">Sin mensajes recientes</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white/[0.02] border-t border-white/5">
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:tracking-[0.3em]">
                                Abrir Canal de Mensajería
                            </button>
                        </div>
                    </div>

                    {/* Insignias Column */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-3 px-2">
                            <span className="material-symbols-outlined text-yellow-500">stars</span>
                            Insignias de Logro
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {achievements.length > 0 ? achievements.map((item: any, idx) => (
                                <motion.div
                                    key={item.achievements.id}
                                    whileHover={{ rotate: 5, scale: 1.05 }}
                                    className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] text-center group hover:bg-amber-500/5 hover:border-amber-500/20 transition-all cursor-default"
                                >
                                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/10 transition-colors shadow-inner">
                                        <span className="material-symbols-outlined text-3xl text-yellow-500 group-hover:scale-110 transition-transform">
                                            {item.achievements.icon_name || 'military_tech'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-white mb-1 uppercase tracking-tight truncate">{item.achievements.title}</p>
                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                        {new Date(item.unlocked_at).toLocaleDateString()}
                                    </p>
                                </motion.div>
                            )) : (
                                <div className="col-span-full p-4 border border-dashed border-white/5 rounded-3xl text-center opacity-30">
                                    <p className="text-[9px] font-black uppercase tracking-widest">Álbum Vacío</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.main>
    );
}
