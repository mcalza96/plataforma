import React, { Suspense } from 'react';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { getUserId, validateStaff } from '@/lib/infrastructure/auth-utils';
import { DeploymentOrchestrator } from '@/components/admin/deploy/DeploymentOrchestrator';
import { getTeacherCohorts } from '@/lib/actions/admin/deployment-actions';
import { Rocket, ShieldCheck, Cpu } from 'lucide-react';

export default async function MachineRoomPage() {
    await validateStaff();
    const teacherId = await getUserId();
    const supabase = await createClient();

    // 1. Fetch Probes (Items available for deployment)
    const { data: probes } = await supabase
        .from('diagnostic_probes')
        .select(`
            id,
            stem,
            competency_nodes (title)
        `)
        .order('created_at', { ascending: false });

    // 2. Fetch Cohorts
    const cohorts = await getTeacherCohorts();

    // Transform probes for the UI
    const mappedProbes = (probes || []).map(p => ({
        id: p.id,
        title: (p.competency_nodes as any)?.title || 'Sonda sin Título',
        description: p.stem.substring(0, 60) + '...'
    }));

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 p-8">
            {/* Header: Control Tower Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#1A1A1A]/30 border border-white/5 p-10 rounded-[3rem] backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Cpu size={240} className="text-emerald-500" />
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Sala de Máquinas: Centro de Despliegue</p>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                        Orquestrador de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Impacto</span>
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-xl font-medium">
                        Interviene en el Grafo de Conocimiento. Arrastra las sondas hacia las cohortes para activar nuevos nodos en la Frontera de Aprendizaje.
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Capacidad</span>
                        <span className="text-lg font-black text-white italic">{mappedProbes.length} / 100</span>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Escudo Activo</span>
                    </div>
                </div>
            </div>

            {/* Main DnD Workspace */}
            <Suspense fallback={
                <div className="h-[600px] w-full flex flex-col items-center justify-center gap-4 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="size-10 rounded-full border-4 border-t-emerald-500 border-white/5 animate-spin" />
                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Inicializando Sincronizador de Grafo...</p>
                </div>
            }>
                <DeploymentOrchestrator
                    probes={mappedProbes}
                    cohorts={cohorts || []}
                />
            </Suspense>

            {/* Footer / Status Bar */}
            <div className="flex items-center justify-between px-10 py-4 bg-black/40 border-t border-white/5 rounded-b-[3rem]">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Telemetría OK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">M:N Mapping Enabled</span>
                    </div>
                </div>
                <p className="text-[9px] font-mono text-zinc-700">TEACHEROS ENGINE V2.4 // ENGINE_STATUS: STEADY</p>
            </div>
        </div>
    );
}
