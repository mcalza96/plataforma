import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import Link from "next/link";
import { ChevronRight, ShieldAlert, Sparkles, Terminal, Activity, Ghost, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCompetencyInventory } from "@/lib/actions/admin/architect-actions";

export default async function CapabilityInventoryPage() {
    const { nodes, success } = await getCompetencyInventory();

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#1A1A1A]/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Auditoría de Modelos Mentales</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Inventario de Capacidades</h1>
                    <p className="text-gray-400 text-sm max-w-md">Mapa de salud del Grafo de Conocimiento y Sondas de Calibración activas.</p>
                </div>

                <Link
                    href="/admin/exam-builder?reset=true"
                    className="flex items-center gap-2 bg-amber-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                >
                    <Zap size={16} />
                    DISEÑAR SONDA
                </Link>
            </div>

            {/* Health Matrix */}
            <div className="grid grid-cols-1 gap-4">
                {nodes?.map((node: any) => (
                    <div
                        key={node.id}
                        className="group bg-[#1F1F1F] border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors relative">
                                <Activity size={28} />
                                <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-[#1F1F1F] flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white leading-none">
                                        {node.metadata?.healthScore || 100}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-black text-white italic uppercase truncate">{node.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1.5 text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        <Ghost size={10} className="text-red-400" />
                                        <span className="text-[9px] font-bold uppercase">
                                            {node.metadata?.shadowNodesCount || 0} Nodos Sombra
                                        </span>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "text-[9px] font-bold border-white/5",
                                        node.diagnostic_probes?.length > 0 ? "bg-amber-500/10 text-amber-500" : "bg-zinc-500/10 text-zinc-400"
                                    )}>
                                        {node.diagnostic_probes?.length > 0 ? 'SONDA ACTIVA' : 'SIN SONDA'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex flex-col items-end gap-1 px-4 border-r border-white/5 hidden md:flex">
                                <span className="text-[8px] font-black text-zinc-500 uppercase">Calibración</span>
                                <span className={`text-[11px] font-black ${(node.metadata?.healthScore || 100) > 80 ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>
                                    {(node.metadata?.healthScore || 100) > 80 ? 'OPTIMAL' : 'RECALIBRAR'}
                                </span>
                            </div>

                            <Link
                                href={`/admin/inventory/${node.id}/audit`}
                                className="size-11 flex items-center justify-center border border-white/5 bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all ml-2"
                                title="Forensic Audit"
                            >
                                <ChevronRight size={18} />
                            </Link>

                        </div>
                    </div>
                ))}

                {(!nodes || nodes.length === 0) && (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest px-8">El Inventario de Capacidades está vacío. Comienza diseñando una Sonda de Calibración.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
