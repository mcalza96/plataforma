import { getLatestDiagnosticResult } from '@/lib/actions/student/assessment-actions';
import { LandingProfile } from './insights/LandingProfile';
import { CognitiveMirror } from '@/components/assessment/results/CognitiveMirror';
import { Sparkles } from 'lucide-react';

export async function ExecutiveIntelligenceSection() {
    const diagnostic = await getLatestDiagnosticResult();

    if (!diagnostic) {
        return (
            <div className="p-8 rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 bg-indigo-500/10 rounded-full">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-200">Calibración Pendiente</h3>
                    <p className="text-slate-400 max-w-md mx-auto mt-2 text-sm">
                        Para activar tu Espejo Metacognitivo, completa tu primera "Sonda de Calibración". El sistema necesita datos para entender tu arquetipo de aprendizaje.
                    </p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">
                    Iniciar Diagnóstico
                </button>
            </div>
        );
    }

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Inteligencia Ejecutiva
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
                    v1.0.4-beta
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LandingProfile profile={diagnostic.behaviorProfile} />
                <CognitiveMirror calibration={diagnostic.calibration} />
            </div>
        </section>
    );
}
