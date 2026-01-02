import { Suspense } from 'react';
import { getFairnessAuditData } from '@/lib/actions/admin/analytics/fairness-actions';
import FairnessAuditDashboard from '@/components/admin/analytics/FairnessAuditDashboard';
import { Scale, ShieldCheck, Filter, Download, Info } from 'lucide-react';

export const metadata = {
    title: 'Auditoría de Equidad Algorítmica | TeacherOS',
    description: 'Monitoreo de Impacto Dispar y Paridad demográfica en la remediación pedagógica.',
};

export default async function FairnessAuditPage() {
    const fairnessData = await getFairnessAuditData();

    return (
        <main className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-violet-400">
                        <Scale className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Ethics Compliance</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Torre de Control de Equidad</h1>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed font-medium">
                        Auditoría forense de sesgo algorítmico. TeacherOS garantiza que la remediación pedagógica
                        sea daltónica respecto a grupos demográficos y dispositivos de acceso.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#252525] border border-white/5 rounded-xl hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar Reporte Ético
                    </button>
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Integridad Validada</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Grupos Auditados', value: fairnessData.groupMetrics.length, color: 'text-indigo-400' },
                    { label: 'Ratio de Impacto', value: `${Math.round(fairnessData.impactRatio * 100)}%`, color: 'text-white' },
                    { label: 'Ítems en Cuarentena', value: fairnessData.difAlerts.length, color: 'text-rose-400' },
                    { label: 'Certificación', value: fairnessData.equityStatus, color: 'text-emerald-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#252525] border border-white/5 p-5 rounded-2xl">
                        <p className="text-2xl font-mono font-black text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-tight">{stat.label}</p>
                    </div>
                ))}
            </div>

            <Suspense fallback={
                <div className="w-full h-96 bg-[#252525] animate-pulse rounded-3xl flex items-center justify-center border border-dashed border-white/10">
                    <p className="text-slate-500 font-bold uppercase tracking-widest animate-bounce">Evaluando Paridad de Grupos...</p>
                </div>
            }>
                <FairnessAuditDashboard data={fairnessData} />
            </Suspense>

            {/* Educational Disclaimer */}
            <div className="bg-violet-500/5 border border-violet-500/10 p-8 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-violet-400">
                    <Info className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Glosario de Equidad IA</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-300 uppercase">Impacto Dispar (4/5 Rule)</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Es un estándar legal y estadístico que indica que una práctica es discriminatoria si la tasa de selección
                            del grupo protegido es inferior al 80% de la del grupo con la tasa más alta. TeacherOS aplica esto
                            a la **probabilidad de recibir remediación** de alta calidad.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-300 uppercase">Conocimiento Frágil y Fatiga Móvil</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Detectamos si los alumnos en dispositivos móviles cometen más errores por distracción o fatiga visual,
                            lo que podría inflar artificialmente la necesidad de remediación. Calibramos el motor para
                            ser más indulgente con la latencia en mobile.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
