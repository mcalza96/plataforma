import { Suspense } from 'react';
import { getGlobalKnowledgeMap } from '@/lib/actions/admin/admin-analytics-actions';
import GlobalKnowledgeHeatmap from '@/components/admin/analytics/GlobalKnowledgeHeatmap';
import { Network, Search, Filter, Settings, Info } from 'lucide-react';

export const metadata = {
    title: 'Institutional Knowledge Map | TeacherOS',
    description: 'Visualización de la salud curricular y detección de cuellos de botella mediante KST.',
};

export default async function KnowledgeMapPage() {
    const graphData = await getGlobalKnowledgeMap();

    return (
        <div className="space-y-8 pb-20">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Network className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deep Learning Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">Mapa de Calor Institucional</h1>
                        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed font-medium">
                            Visualización de la salud de la malla curricular basada en el DAG de competencias.
                            Detección de cuellos de botella pedagógicos mediante Teoría de Espacios de Conocimiento.
                        </p>
                    </div>

                    <div className="flex bg-[#252525] border border-white/10 rounded-2xl p-2 gap-2">
                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">KST Engine Online</span>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Nodos Curriculares', value: graphData.nodes.length, icon: 'hub' },
                        { label: 'Relaciones (Edges)', value: graphData.edges.length, icon: 'mediation' },
                        { label: 'Tráfico Acumulado', value: graphData.nodes.reduce((acc, n) => acc + n.student_count, 0), icon: 'trending_up' },
                        { label: 'Salud Global', value: `${Math.round(graphData.nodes.reduce((acc, n) => acc + (n.average_mastery || 0), 0) / (graphData.nodes.length || 1))}%`, icon: 'clinical_notes' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#252525] border border-white/5 p-5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center justify-between mb-3 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Vitals {i + 1}</span>
                            </div>
                            <p className="text-3xl font-mono font-black text-white">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase mt-1 tracking-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Graph Viewport */}
                <Suspense fallback={
                    <div className="w-full h-[700px] bg-[#252525]/50 animate-pulse rounded-3xl flex items-center justify-center border border-dashed border-white/10">
                        <p className="text-slate-500 font-bold uppercase tracking-widest animate-bounce">Sincronizando Grafo Curricular...</p>
                    </div>
                }>
                    <GlobalKnowledgeHeatmap data={graphData} />
                </Suspense>

                {/* Legend / Info Footer */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">Metodología de Análisis de Espacios de Conocimiento (KST)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
                            Esta visualización no es estática. El motor de TeacherOS calcula en tiempo real cómo la **fricción pedagógica**
                            en conceptos fundamentales (nodos de mayor tamaño) afecta la probabilidad de éxito en temas avanzados.
                            Un nodo **rojo y grande** indica un concepto que "nadie entiende" y que está bloqueando el avance de una cohorte entera.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
