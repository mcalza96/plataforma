"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { DiagnosticResult } from "@/lib/domain/assessment";

/**
 * Server Action to export exam results to CSV.
 * Only accessible by Instructors (owners) or Admins.
 */
export async function exportExamResultsToCSV(examId: string) {
    const supabase = await createClient();

    // 1. Authorization & Identity
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch exam to check ownership
    const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("creator_id, title")
        .eq("id", examId)
        .single();

    if (examError || !exam) throw new Error("Exam not found");

    // Fetch profile to check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const isInstructor = profile?.role === 'instructor';

    if (!isAdmin && (!isInstructor || exam.creator_id !== user.id)) {
        throw new Error("Forbidden: You do not have permission to export this diagnostic.");
    }

    // 2. Fetch all completed attempts with learner details
    // Note: We use the helper join if profiles table is correctly linked
    const { data: attempts, error: attemptsError } = await supabase
        .from("exam_attempts")
        .select(`
            id,
            learner_id,
            results_cache,
            profiles:learner_id (
                full_name,
                email
            )
        `)
        .eq("exam_config_id", examId)
        .eq("status", "COMPLETED")
        .order("finished_at", { ascending: false });

    if (attemptsError || !attempts) {
        console.error("Export fetch error:", attemptsError);
        throw new Error("Failed to fetch results for export.");
    }

    // 3. Generate CSV
    const headers = [
        "Alumno",
        "Email",
        "Score Final (%)",
        "Impulsividad",
        "Ansiedad",
        "Bugs/Confusiones Detectadas"
    ];

    const rows = attempts.map(attempt => {
        const result = attempt.results_cache as unknown as DiagnosticResult;
        const learnerProfile = (attempt.profiles as any);

        // Detailed bugs list for the instructor
        const bugs = result?.competencyDiagnoses
            ? result.competencyDiagnoses
                .filter(d => d.state === 'MISCONCEPTION')
                .map(d => `${d.competencyId}: ${d.evidence.reason}`)
                .join(" | ")
            : "N/A";

        return [
            learnerProfile?.full_name || "Estudiante Anónimo",
            learnerProfile?.email || "N/A",
            result?.overallScore !== undefined ? `${result.overallScore}%` : "0%",
            result?.behaviorProfile?.isImpulsive ? "SÍ" : "NO",
            result?.behaviorProfile?.isAnxious ? "SÍ" : "NO",
            bugs || "Ninguno"
        ];
    });

    // Helper functions for CSV escaping
    const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(cell => escapeCSV(String(cell))).join(","))
    ].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    return {
        success: true,
        filename: `Resultados_${exam.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
        content: BOM + csvContent
    };
}
