"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";

/**
 * Server Action to export exam results as a CSV file.
 * Returns a string representing the CSV content with UTF-8 BOM.
 */
export async function exportExamResults(examId: string) {
    const supabase = await createClient();

    // 1. Security Check (Only Staff can export)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Check if user is admin or instructor
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || !['admin', 'instructor'].includes(profile.role)) {
        return { success: false, error: "Forbidden: Only instructors can export results" };
    }

    // 2. Fetch all completed attempts for this exam
    const { data: attempts, error: fetchError } = await supabase
        .from("exam_attempts")
        .select(`
            id,
            learner_id,
            started_at,
            finished_at,
            results_cache,
            profiles:learner_id (
                full_name,
                email
            )
        `)
        .eq("exam_config_id", examId)
        .eq("status", "COMPLETED")
        .order("finished_at", { ascending: false });

    if (fetchError) {
        console.error("Export fetch error:", fetchError);
        return { success: false, error: "Failed to fetch results" };
    }

    if (!attempts || attempts.length === 0) {
        return { success: false, error: "No completed attempts found to export" };
    }

    // 3. Transform to CSV
    const headers = [
        "Nombre",
        "Email",
        "ID Intento",
        "Fecha Inicio",
        "Fecha Fin",
        "Score Global",
        "Diagnóstico"
    ];

    const rows = attempts.map((a: any) => {
        const result = a.results_cache;
        const student = a.profiles;

        // Flatten diagnostic states for a text summary
        const diagnosticSummary = result?.competencyDiagnoses
            ?.map((d: any) => `${d.competencyId}: ${d.state}`)
            .join("; ") || "N/A";

        return [
            student?.full_name || "N/A",
            student?.email || "N/A",
            a.id,
            a.started_at ? new Date(a.started_at).toLocaleString() : "N/A",
            a.finished_at ? new Date(a.finished_at).toLocaleString() : "N/A",
            result?.overallScore !== undefined ? `${result.overallScore}%` : "0%",
            diagnosticSummary
        ];
    });

    // Strategy: Use UTF-8 with BOM (\uFEFF) so Excel opens it with correct encoding
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const bom = "\uFEFF";

    return {
        success: true,
        csv: bom + csvContent,
        filename: `reporte_examen_${examId}_${new Date().toISOString().split('T')[0]}.csv`
    };
}
