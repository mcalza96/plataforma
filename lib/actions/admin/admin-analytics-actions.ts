"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { DiagnosticResult, CompetencyEvaluationState } from "@/lib/domain/evaluation/types";

export type CohortAnalytics = {
    examTitle: string;
    kpis: {
        frictionIndex: number;
        maxRiskConcept: { id: string; title: string; bugCount: number } | null;
        averageECE: number;
    };
    competencies: {
        id: string;
        title: string;
        stats: {
            masteredCount: number;
            gapCount: number;
            bugCount: number;
            unknownCount: number;
        };
        topMisconception: string | null;
    }[];
    heatMap: {
        studentId: string;
        studentName: string;
        states: Record<string, CompetencyEvaluationState>;
        eceScore: number;
    }[];
};

export async function getCohortAnalytics(examId: string): Promise<CohortAnalytics | null> {
    const supabase = await createClient();

    // 1. Fetch Exam details (Blueprint)
    const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("title, config_json")
        .eq("id", examId)
        .single();

    if (examError || !exam) {
        console.error("Error fetching exam for analytics:", examError);
        return null;
    }

    // 2. Fetch all completed attempts with profile details
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
        .eq("status", "COMPLETED");

    if (attemptsError) {
        console.error("Error fetching attempts for analytics:", attemptsError);
        return null;
    }

    const typedAttempts = (attempts || []) as any[];
    const blueprintCompetencies = exam.config_json?.concepts || []; // Fallback to empty if not structured

    // 3. Aggregate Data
    const heatMap: CohortAnalytics["heatMap"] = [];
    const compStats: Record<string, CohortAnalytics["competencies"][0]["stats"] & { topReasons: Record<string, number> }> = {};

    // Initialize stats
    blueprintCompetencies.forEach((c: any) => {
        compStats[c.id] = {
            masteredCount: 0,
            gapCount: 0,
            bugCount: 0,
            unknownCount: 0,
            topReasons: {}
        };
    });

    let totalECE = 0;
    let studentsWithBugs = 0;

    for (const attempt of typedAttempts) {
        const result = attempt.results_cache as DiagnosticResult;
        if (!result) continue;

        const studentName = attempt.profiles?.full_name || attempt.profiles?.email || `ID: ${attempt.learner_id.slice(0, 5)}`;
        const studentStates: Record<string, CompetencyEvaluationState> = {};
        let hasBug = false;

        for (const diagnosis of result.competencyDiagnoses) {
            const state = diagnosis.state;
            studentStates[diagnosis.competencyId] = state;

            // Update stats
            if (compStats[diagnosis.competencyId]) {
                if (state === 'MASTERED') compStats[diagnosis.competencyId].masteredCount++;
                else if (state === 'GAP') compStats[diagnosis.competencyId].gapCount++;
                else if (state === 'MISCONCEPTION') {
                    compStats[diagnosis.competencyId].bugCount++;
                    hasBug = true;
                    // Track reasons for top misconception
                    const reason = diagnosis.evidence.reason;
                    compStats[diagnosis.competencyId].topReasons[reason] = (compStats[diagnosis.competencyId].topReasons[reason] || 0) + 1;
                }
                else compStats[diagnosis.competencyId].unknownCount++;
            }
        }

        if (hasBug) studentsWithBugs++;
        totalECE += result.calibration?.eceScore || 0;

        heatMap.push({
            studentId: attempt.learner_id,
            studentName,
            states: studentStates,
            eceScore: result.calibration?.eceScore || 0
        });
    }

    // 4. Final Formatting
    const competencies: CohortAnalytics["competencies"] = blueprintCompetencies.map((c: any) => {
        const stats = compStats[c.id];
        let topMisconception = null;
        if (stats && Object.keys(stats.topReasons).length > 0) {
            topMisconception = Object.entries(stats.topReasons)
                .sort((a, b) => b[1] - a[1])[0][0];
        }

        return {
            id: c.id,
            title: c.name || c.title,
            stats: stats || { masteredCount: 0, gapCount: 0, bugCount: 0, unknownCount: 0 },
            topMisconception
        };
    });

    // KPI Calculations
    const totalStudents = heatMap.length;
    const frictionIndex = totalStudents > 0 ? Math.round((studentsWithBugs / totalStudents) * 100) : 0;
    const averageECE = totalStudents > 0 ? Math.round(totalECE / totalStudents) : 0;

    let maxRiskConcept = null;
    if (competencies.length > 0) {
        const sortedByBug = [...competencies].sort((a, b) => b.stats.bugCount - a.stats.bugCount);
        if (sortedByBug[0].stats.bugCount > 0) {
            maxRiskConcept = {
                id: sortedByBug[0].id,
                title: sortedByBug[0].title,
                bugCount: sortedByBug[0].stats.bugCount
            };
        }
    }

    return {
        examTitle: exam.title,
        kpis: {
            frictionIndex,
            maxRiskConcept,
            averageECE
        },
        competencies,
        heatMap
    };
}
