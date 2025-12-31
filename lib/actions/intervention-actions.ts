"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { DiagnosticResult, CompetencyDiagnosis } from "@/lib/domain/evaluation/types";
import { AtomicLearningObject } from "@/lib/domain/schemas/alo";

interface InterventionItem {
    diagnosis: CompetencyDiagnosis;
    content: AtomicLearningObject[];
}

/**
 * getPersonalizedInterventions: Matches detected "Bugs" and "Gaps" with 
 * educational content from the Brickyard (content_library).
 */
export async function getPersonalizedInterventions(attemptId: string) {
    const supabase = await createClient();

    // 1. Fetch Attempt and Result
    const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .select("results_cache, exam_config_id")
        .eq("id", attemptId)
        .single();

    if (attemptError || !attempt || !attempt.results_cache) {
        console.error("Intervention Fetch Error:", attemptError);
        return { success: false, error: "No se encontró el diagnóstico para generar intervenciones." };
    }

    const result = attempt.results_cache as unknown as DiagnosticResult;

    // 2. Identify Critical Skills (Bugs and Gaps)
    const criticalIssues = result.competencyDiagnoses.filter(
        d => d.state === 'MISCONCEPTION' || d.state === 'GAP'
    );

    if (criticalIssues.length === 0) {
        return { success: true, interventions: [], message: "¡Sin brechas críticas detectadas! Estás listo para el siguiente nivel." };
    }

    // 3. Match with Content Library
    // We search for content where any of the critical skills appear in metadata->skills
    const criticalSkillIds = criticalIssues.map(i => i.competencyId);

    // In Supabase/PostgreSQL, we can query JSONB arrays using the ? operator or @>
    // However, since we want specific content for EACH issue to prioritize them, 
    // we'll fetch them efficiently.
    const { data: contents, error: contentError } = await supabase
        .from("content_library")
        .select("*")
        .contains('metadata', { skills: [] }); // This is a placeholder for the logic below

    // Better approach: Use the 'cs' (contains) operator for the array in JSONB
    const { data: matchingContent, error: matchError } = await supabase
        .from("content_library")
        .select("*")
        .filter('metadata->skills', 'cs', JSON.stringify(criticalSkillIds));

    if (matchError) {
        console.error("Content Matching Error:", matchError);
        // Fallback or handle error
    }

    // 4. Group interventions by diagnosis for the UI
    const interventions: InterventionItem[] = criticalIssues.map(diagnosis => {
        const matchingItems = (matchingContent || []).filter(content =>
            content.metadata?.skills?.includes(diagnosis.competencyId)
        ) as AtomicLearningObject[];

        return {
            diagnosis,
            content: matchingItems
        };
    });

    // 5. Prioritize (Misconceptions first)
    interventions.sort((a, b) => {
        if (a.diagnosis.state === 'MISCONCEPTION' && b.diagnosis.state !== 'MISCONCEPTION') return -1;
        if (a.diagnosis.state !== 'MISCONCEPTION' && b.diagnosis.state === 'MISCONCEPTION') return 1;
        return 0;
    });

    return {
        success: true,
        interventions
    };
}
