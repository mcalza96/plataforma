import { getStudentKnowledgeGraph } from '@/lib/actions/student/curriculum-actions';
import { KnowledgeMap } from './KnowledgeMap';
import { Map, Zap } from 'lucide-react';
import { UIMode } from '@/lib/application/services/interface-adapter';
import Link from 'next/link';

interface KnowledgeMapSectionProps {
    mode?: UIMode;
}

export async function KnowledgeMapSection({ mode = 'EXPLORER' }: KnowledgeMapSectionProps) {
    const graph = await getStudentKnowledgeGraph();

    if (!graph || graph.nodes.length === 0) {
        return (
            <div className={`p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 ${mode === 'MISSION' ? 'col-span-1' : ''}`}>
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-slate-800">
                        <Map className="w-8 h-8 text-slate-600" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-slate-400 mb-2">Topología No Detectada</h3>
                <p className="max-w-md mx-auto text-sm">
                    El sistema aún no ha mapeado tu territorio de aprendizaje.
                </p>
            </div>
        );
    }

    // MISSION MODE: Simplified View (Just the Active Frontier)
    if (mode === 'MISSION') {
        const availableNode = graph.nodes.find(n => n.status === 'AVAILABLE');

        return (
            <section className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-widest mb-6">
                    <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                    Misión Activa
                </div>

                {availableNode ? (
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            {availableNode.label}
                        </h2>
                        <p className="text-lg text-indigo-200/80 max-w-lg mx-auto leading-relaxed">
                            {availableNode.description}
                        </p>
                        <Link
                            href={`/lessons/${availableNode.id}`}
                            className="inline-flex items-center justify-center h-16 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                        >
                            Comenzar Misión
                        </Link>
                    </div>
                ) : (
                    <div className="py-10">
                        <h2 className="text-2xl font-bold text-white">¡Todas las misiones completadas!</h2>
                        <p className="text-slate-400 mt-2">Espera nuevas instrucciones del comando.</p>
                    </div>
                )}
            </section>
        );
    }

    // EXPLORER & DASHBOARD: Full Map
    return (
        <section className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ${mode === 'DASHBOARD' ? 'col-span-full' : ''}`}>
            <KnowledgeMap graph={graph} />
        </section>
    );
}
