"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";

export interface DashboardSnapshot {
    pathologyRanking: {
        competencyId: string;
        state: string;
        count: number;
        avgConfidence: number;
    }[];
    itemHealth: {
        questionId: string;
        accuracy: number;
        medianTime: number;
        status: 'HEALTHY' | 'BROKEN' | 'TRIVIAL';
    }[];
    cohortRadar: {
        studentId: string;
        score: number;
        ece: number;
        archetype: string;
    }[];
}

export async function getDashboardSnapshot(examId: string): Promise<DashboardSnapshot> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Fetch Pathology Ranking
    const { data: pathology } = await supabase
        .from('vw_pathology_ranking')
        .select('*')
        .eq('exam_id', examId)
        .eq('teacher_id', user.id) // Tenant Isolation
        .order('total_occurrences', { ascending: false })
        .limit(5);

    // 2. Fetch Item Health
    const { data: items } = await supabase
        .from('vw_item_health')
        .select('*')
        .eq('exam_id', examId)
        .eq('teacher_id', user.id);

    // 3. Fetch Cohort Radar
    const { data: cohort } = await supabase
        .from('vw_cohort_radar')
        .select('*')
        .eq('exam_id', examId)
        .eq('teacher_id', user.id);

    return {
        pathologyRanking: (pathology || []).map(p => ({
            competencyId: p.competency_id,
            state: p.state,
            count: p.total_occurrences,
            avgConfidence: p.avg_confidence_score
        })),
        itemHealth: (items || []).map(i => ({
            questionId: i.question_id,
            accuracy: i.accuracy_rate,
            medianTime: i.median_time_ms,
            status: i.health_status
        })),
        cohortRadar: (cohort || []).map(c => ({
            studentId: c.student_id,
            score: c.overall_score,
            ece: c.ece_score,
            archetype: c.student_archetype
        }))
    };
}
