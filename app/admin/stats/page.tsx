import { createClient } from '@/lib/supabase-server';

export default async function AdminStatsPage() {
    const supabase = await createClient();

    // Quick counts
    const { count: totalLearners } = await supabase.from('learners').select('*', { count: 'exact', head: true });
    const { count: totalSubmissions } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
    const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div>
                <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Métricas de la Academia</p>
                <h1 className="text-3xl font-black tracking-tighter">Estadísticas Globales</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-colors">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Alumnos</p>
                    <p className="text-5xl font-black text-white">{totalLearners}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-colors">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Entregas Totales</p>
                    <p className="text-5xl font-black text-white">{totalSubmissions}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                    <p className="text-sm font-bold text-amber-500/70 uppercase tracking-widest mb-2">Cursos Activos</p>
                    <p className="text-5xl font-black text-amber-500">{totalCourses}</p>
                </div>
            </div>

            <div className="bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl p-20 text-center">
                <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-700 shadow-inner">
                    <span className="material-symbols-outlined text-5xl">query_stats</span>
                </div>
                <h3 className="text-xl font-bold text-gray-500">Analíticas Avanzadas</h3>
                <p className="text-gray-600 max-w-sm mx-auto mt-2">Estamos procesando datos de retención, tiempo promedio de práctica y niveles de XP para mostrarte insights más profundos próximamente.</p>
            </div>
        </div>
    );
}
