import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { notFound, redirect } from "next/navigation";
import { StudentReportView } from "@/components/dashboard/views/StudentReportView";
import { DiagnosticResult } from "@/lib/domain/evaluation/types";

interface ResultsPageProps {
    params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // 1. Fetch the latest completed attempt for this exam
    const { data: attempt, error } = await supabase
        .from("exam_attempts")
        .select("*, exams(title)")
        .eq("exam_config_id", id)
        .eq("learner_id", user.id)
        .eq("status", "COMPLETED")
        .order("finished_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !attempt) {
        // If not completed, check if in progress
        const { data: inProgress } = await supabase
            .from("exam_attempts")
            .select("id")
            .eq("exam_config_id", id)
            .eq("learner_id", user.id)
            .eq("status", "IN_PROGRESS")
            .single();

        if (inProgress) {
            return (
                <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                    <div className="text-center space-y-4">
                        <div className="animate-spin size-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm font-mono uppercase tracking-widest text-zinc-500">
                            Analizando evidencia pedagógica...
                        </p>
                    </div>
                </div>
            );
        }
        notFound();
    }

    if (!attempt.results_cache) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
                <div className="text-center space-y-4">
                    <p className="text-sm font-mono uppercase tracking-widest text-zinc-500">
                        El diagnóstico está siendo procesado. Por favor, refresca en unos segundos.
                    </p>
                </div>
            </div>
        );
    }

    const result = attempt.results_cache as unknown as DiagnosticResult;

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Resultado del Diagnóstico</h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{attempt.exams?.title}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-600 font-mono uppercase">ID de Sesión: {attempt.id}</p>
                        <p className="text-[10px] text-zinc-600 font-mono uppercase">Fin: {new Date(attempt.finished_at).toLocaleString()}</p>
                    </div>
                </header>

                <StudentReportView result={result} />
            </div>
        </div>
    );
}
