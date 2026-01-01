import { getLatestDiagnosticResult } from '@/lib/actions/student/assessment-actions';
import { FeedbackGenerator } from '@/lib/application/services/feedback-generator';
import { Sparkles, Terminal } from 'lucide-react';
import Link from 'next/link';

interface DashboardFeedbackProps {
    studentId: string;
}

export default async function DashboardFeedback({ studentId }: DashboardFeedbackProps) {
    const diagnostic = await getLatestDiagnosticResult();

    if (!diagnostic) return null;

    const narrative = FeedbackGenerator.generate(diagnostic);

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />

            <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] z-10">
                <Terminal className="w-7 h-7 text-indigo-400" />
            </div>

            <div className="flex-1 z-10 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Diagnóstico en Vivo</p>
                </div>

                <div className="space-y-4 font-mono text-sm leading-relaxed text-slate-300">
                    {narrative.glow.length > 0 && (
                        <div className="flex gap-3">
                            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <p><span className="text-emerald-400 font-bold">GLOW:</span> {narrative.glow[0]}</p>
                        </div>
                    )}

                    {narrative.grow.length > 0 && (
                        <div className="flex gap-3">
                            <Terminal className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <p><span className="text-amber-400 font-bold">GROW:</span> {narrative.grow[0]}</p>
                        </div>
                    )}

                    {narrative.meta && (
                        <div className="pl-7 text-xs text-slate-500 border-l border-slate-700 italic">
                            "{narrative.meta}"
                        </div>
                    )}
                </div>
            </div>

            <Link
                href="/dashboard/insights"
                className="self-end sm:self-center bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 border border-slate-700 z-10"
            >
                Ver Informe
            </Link>
        </div>
    );
}

