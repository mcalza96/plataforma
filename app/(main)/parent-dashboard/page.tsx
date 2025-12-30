import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLearnerFullStats, getInstructorFeedback, getLearnerAchievements, getKnowledgeDelta, getLearningFrontier } from '@/lib/parent';
import { getLearnerById } from '@/lib/data/courses';
import Header from '@/components/layout/header';
import OptimizedImage from '@/components/ui/OptimizedImage';
import StatCard from '@/components/ui/StatCard';
import SkillHeatmap from '@/components/parent/SkillHeatmap';
import DeltaChart from '@/components/parent/DeltaChart';

export default async function ParentDashboardPage() {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    const learner = await getLearnerById(learnerId);
    if (!learner) return redirect('/select-profile');

    const [stats, feedback, achievements, knowledgeDelta, frontier] = await Promise.all([
        getLearnerFullStats(learnerId),
        getInstructorFeedback(learnerId),
        getLearnerAchievements(learnerId),
        getKnowledgeDelta(learnerId),
        getLearningFrontier(learnerId)
    ]);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {/* Parent Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-[2rem] border-4 border-surface overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)] avatar-glow bg-neutral-900">
                            <OptimizedImage
                                src={learner.avatar_url || ''}
                                alt={learner.display_name}
                                fill
                                className="object-cover"
                                fallbackIcon="person"
                            />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1 block">Estás supervisando a:</span>
                            <h1 className="text-4xl font-black tracking-tighter">
                                <span className="bg-gradient-to-r from-primary to-neon-violet bg-clip-text text-transparent">
                                    {learner.display_name}
                                </span>
                            </h1>
                            <p className="text-gray-400 mt-1">Artista en formación • Nivel {learner.level}</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                            value={stats.hoursPracticed}
                            label="Horas de Vuelo"
                            icon="schedule"
                            variant="default"
                            className="text-center"
                        />
                        <StatCard
                            value={stats.totalProjects}
                            label="Obras Creadas"
                            icon="palette"
                            variant="default"
                            className="text-center"
                        />
                        <StatCard
                            value={stats.completedLections}
                            label="Metas Logradas"
                            icon="trophy"
                            variant="primary"
                            className="hidden lg:block text-center"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left & Center: Progress and Skills */}
                    <div className="lg:col-span-2 space-y-12">

                        <div className="grid md:grid-cols-2 gap-8">
                            <SkillHeatmap skills={stats.skills} />
                            <DeltaChart data={knowledgeDelta} />
                        </div>

                        {/* Learning Frontier (Next LEGO Bricks) */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3 px-2">
                                <span className="material-symbols-outlined text-primary">view_module</span>
                                Próximos Ladrillos de Aprendizaje
                                <span className="text-[10px] font-black text-primary/50 bg-primary/5 px-2 py-1 rounded-lg uppercase">Fisura de Frontera</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {frontier.length > 0 ? frontier.map((node: any) => (
                                    <div key={node.id} className="group relative bg-[#252525] border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/50 transition-all overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform blur-2xl" />
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Módulo Desbloqueado</p>
                                            <h4 className="text-lg font-black text-white mb-2 leading-tight tracking-tight">{node.title_override || 'Fase de Construcción'}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 italic mb-6 leading-relaxed">
                                                {node.description_override || 'Este nodo ha sido liberado por el cumplimiento de prerrequisitos técnicos.'}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-gray-700 text-sm">architecture</span>
                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Orden: {node.order}</span>
                                                </div>
                                                <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">rocket_launch</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full border-2 border-dashed border-white/5 p-16 rounded-[2.5rem] text-center bg-white/[0.01]">
                                        <span className="material-symbols-outlined text-4xl text-gray-800 mb-4">lock</span>
                                        <p className="text-gray-600 italic font-medium max-w-xs mx-auto">Toda la frontera actual ha sido dominada. El instructor está preparando nuevos desafíos.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Project Highlights (Evidence) */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 px-2">
                                <span className="material-symbols-outlined text-neon-violet">palette</span>
                                Galería de Evidencias (Creación)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {stats.totalProjects > 0 ? (
                                    <div className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">folder_open</span>
                                            </div>
                                            <span className="px-2 py-1 bg-neon-violet/10 text-neon-violet text-[10px] font-black rounded-lg">PROYECTO FINAL</span>
                                        </div>
                                        <h4 className="font-bold text-white mb-1">Módulo de Escultura Digital</h4>
                                        <p className="text-xs text-gray-500 mb-4 italic">Evidencia técnica de dominio en nivel "Crear" de Bloom.</p>
                                        <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                                            Ver Archivo de Entrega
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="col-span-full border-2 border-dashed border-white/5 p-8 rounded-3xl text-center">
                                        <p className="text-gray-500 italic">No hay evidencias registradas aún. Los proyectos finales aparecerán aquí.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Achievements */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 px-2">
                                <span className="material-symbols-outlined text-yellow-500">military_tech</span>
                                Insignias Desbloqueadas
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {achievements.length > 0 ? achievements.map((item: any) => (
                                    <div key={item.achievements.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl text-center group hover:bg-white/5 transition-colors">
                                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                                            <span className="material-symbols-outlined text-3xl text-yellow-500">{item.achievements.icon_name}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white mb-1">{item.achievements.title}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                            {new Date(item.unlocked_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="col-span-full border-2 border-dashed border-white/5 p-10 rounded-3xl text-center">
                                        <p className="text-gray-500">¿Qué insignias ganará hoy?</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Feedback Messages */}
                    <div className="flex flex-col">
                        <div className="bg-surface-darker/50 rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">chat_bubble</span>
                                    Feedback del Profesor
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {feedback.length > 0 ? feedback.map((msg) => (
                                    <div key={msg.id} className="relative pl-6 border-l-2 border-primary/30">
                                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(13,147,242,0.8)]"></div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{msg.sender_name}</p>
                                        <p className="text-sm text-gray-200 leading-relaxed mb-2">
                                            "{msg.content}"
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(msg.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                                        <span className="material-symbols-outlined text-5xl mb-4">notifications_off</span>
                                        <p className="text-sm">Aún no hay mensajes del instructor.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/5">
                                <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
                                    Ver todo el historial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
