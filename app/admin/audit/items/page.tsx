import { Suspense } from 'react';
import ItemHealthMatrix from '@/components/admin/analytics/ItemHealthMatrix';
import { getGlobalItemHealth } from '@/lib/actions/admin/admin-analytics-actions';
import { Activity, ShieldAlert, Zap } from 'lucide-react';

export const metadata = {
    title: 'Auditoría de Ítems | TeacherOS Admin',
    description: 'Matriz de salud de reactivos y diagnóstico de integridad diagnóstica.',
};

export default async function AdminItemAuditPage() {
    const healthData = await getGlobalItemHealth();

    return (
        <div className="space-y-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Torre de Control Estratégica</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Item Health Matrix</h1>
                        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                            Supervisión global de la integridad de los reactivos. Detecta ambigüedades (Slip),
                            ítems triviales y distractores inútiles que no aportan valor diagnóstico a la Caja Blanca.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-[#252525] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Total Ítems</p>
                                <p className="text-xl font-bold text-white">{healthData.length}</p>
                            </div>
                        </div>

                        <div className="bg-[#252525] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-rose-500/10 rounded-lg">
                                <Zap className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Estado Crítico</p>
                                <p className="text-xl font-bold text-white">
                                    {healthData.filter(i => i.health_status === 'BROKEN').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Suspense fallback={
                    <div className="w-full h-96 bg-[#252525] animate-pulse rounded-xl flex items-center justify-center">
                        <p className="text-slate-500 animate-bounce">Sincronizando telemetría forense...</p>
                    </div>
                }>
                    <ItemHealthMatrix data={healthData} />
                </Suspense>

                {/* Footer / Documentation */}
                <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase">HEALTHY (Vende)</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Funcionamiento nominal. Los tiempos de respuesta y tasas de acierto están dentro de la campana de Gauss esperada para el nivel del examen.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-rose-400 uppercase">BROKEN (Rojo)</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Posible ambigüedad o error en la clave. 0% de aciertos con tiempos largos sugieren que incluso los mejores alumnos no logran descifrar el reactivo.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-amber-400 uppercase">TRIVIAL (Amarillo)</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Demasiado fácil. 100% de aciertos en menos de 5 segundos. El ítem no tiene poder discriminativo y consume tiempo del alumno sin aportar datos.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
