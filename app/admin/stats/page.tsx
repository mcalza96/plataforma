import { createClient } from '@/lib/supabase-server';
import StatCard from '@/components/ui/StatCard';

export default async function AdminStatsPage() {
    const supabase = await createClient();

    // Quick counts
    const { count: totalLearners } = await supabase.from('learners').select('*', { count: 'exact', head: true });
    const { count: totalSubmissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
    const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">Centro de Comando</span>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">Estadísticas Globales</h1>
                <p className="text-gray-400 max-w-2xl text-lg">
                    Visión general del rendimiento de la academia y actividad de los estudiantes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Alumnos"
                    value={totalLearners || 0}
                    icon="groups"
                    variant="default"
                />
                <StatCard
                    label="Entregas Totales"
                    value={totalSubmissions || 0}
                    icon="brush"
                    variant="default"
                />
                <StatCard
                    label="Misiones Activas"
                    value={totalCourses || 0}
                    icon="rocket_launch"
                    variant="amber"
                />
            </div>

            {/* Quick Actions / Insights placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-center min-h-[200px] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <span className="material-symbols-outlined">insights</span>
                            <span className="text-xs font-black uppercase tracking-widest">Tendencias</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Retención Semanal</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            El 85% de los alumnos completan al menos una lección por semana.
                        </p>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[85%] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 text-gray-700">
                        <span className="material-symbols-outlined text-3xl">query_stats</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-400">Analíticas Avanzadas</h3>
                    <p className="text-gray-600 text-sm max-w-xs mt-2">
                        Próximamente: Datos de tiempo de práctica y mapas de calor de progreso.
                    </p>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-white/5 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
                        Beta
                    </div>
                </div>
            </div>
        </div>
    );
}
