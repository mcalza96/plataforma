import { Suspense } from 'react';
import ItemHealthMatrix from '@/components/admin/analytics/ItemHealthMatrix';
import ItemCalibrationHeatmap from '@/components/admin/analytics/ItemCalibrationHeatmap';
import IntegrityAlertFeed from '@/components/admin/analytics/IntegrityAlertFeed';
import {
    getGlobalItemCalibration,
    getIntegrityAlerts
} from '@/lib/actions/admin/analytics/item-actions';
import { Activity, ShieldAlert, Zap, Settings, ShieldCheck, Factory } from 'lucide-react';

export const metadata = {
    title: 'Auditoría de Calibración | TeacherOS Admin',
    description: 'Diagnóstico forense del banco de ítems basado en el modelo DINA.',
};

export default async function AdminItemAuditPage() {
    // Fetch data in parallel
    const [calibrationData, integrityAlerts] = await Promise.all([
        getGlobalItemCalibration(),
        getIntegrityAlerts()
    ]);

    return (
        <div className="space-y-10 pb-20 bg-[#1A1A1A] min-h-screen text-slate-200">
            <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
                {/* Header Section: "Sala de Máquinas" Aesthetic */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#252525] p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

                    <div className="relative">
                        <div className="flex items-center gap-3 text-blue-400 mb-3">
                            <Factory className="w-6 h-6 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Calibración de Maquinaria</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-3">Item Dashboard</h1>
                        <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-medium">
                            Auditoría técnica del grafo de conocimiento. Monitoreo en tiempo real de
                            parámetros DINA (Slip/Guess) y detección de resonancias cognitivas ineficientes.
                        </p>
                    </div>

                    <div className="flex gap-4 relative">
                        <div className="bg-black/20 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Items Totales</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{calibrationData.length}</span>
                                <span className="text-[10px] font-mono text-emerald-500">NOMINAL</span>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Slip Alerts</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-rose-500">
                                    {calibrationData.filter(i => (i.slip_param || 0) > 0.4).length}
                                </span>
                                <span className="text-[10px] font-mono text-rose-500/50 uppercase">Critical</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Diagnostics Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Heatmap Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Suspense fallback={<div className="h-[500px] w-full bg-[#252525] animate-pulse rounded-2xl" />}>
                            <ItemCalibrationHeatmap items={calibrationData} />
                        </Suspense>
                    </div>

                    {/* Alerts Section */}
                    <div className="space-y-6">
                        <div className="bg-[#252525] border border-white/5 p-6 rounded-2xl shadow-xl h-full">
                            <Suspense fallback={<div className="h-96 w-full animate-pulse flex items-center justify-center text-slate-500">Procesando alertas forenses...</div>}>
                                <IntegrityAlertFeed alerts={integrityAlerts} />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Detailed Table Section */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Settings className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Matriz Detallada de Salud IRT</h2>
                    </div>

                    <Suspense fallback={
                        <div className="w-full h-96 bg-[#252525] animate-pulse rounded-xl flex items-center justify-center">
                            <p className="text-slate-500 animate-bounce">Sincronizando telemetría forense...</p>
                        </div>
                    }>
                        <ItemHealthMatrix data={calibrationData} />
                    </Suspense>
                </div>

                {/* Footer / Glossary: Machine Aesthetic */}
                <div className="grid md:grid-cols-4 gap-8 py-10 border-t border-white/5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-rose-400 uppercase text-[10px] font-black tracking-widest">
                            <Zap className="w-4 h-4" />
                            Broken (Slip {'>'} 0.4)
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Probabilidad de "Desliz" excesiva. Expertos fallan el ítem sistemáticamente, sugiriendo ambigüedad semántica o clave incorrecta.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-400 uppercase text-[10px] font-black tracking-widest">
                            <Activity className="w-4 h-4" />
                            Trivial (Acc. 100%)
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Baja discriminación. Ítems donde el tiempo de respuesta es nulo y la precisión total, no aportando valor al diagnóstico.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 uppercase text-[10px] font-black tracking-widest">
                            <ShieldCheck className="w-4 h-4" />
                            Guess ($g_j$ Factor)
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Probabilidad de acierto por azar. Un $g_j$ alto indica que los distractores son inefectivos y no capturan la falta de dominio.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 uppercase text-[10px] font-black tracking-widest">
                            <ShieldAlert className="w-4 h-4" />
                            Integridad
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Métrica consolidada de la validez del instrumento. Garantiza que la Caja Blanca no sea contaminada por ruido estadístico.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
