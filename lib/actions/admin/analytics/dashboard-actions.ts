"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { PathologyRankingRow, ItemHealthRow, CohortRadarRow } from "@/lib/domain/analytics-types";

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
    await validateAdmin();
    const supabase = await createClient();

    const { data: pathology } = await supabase
        .from('vw_pathology_ranking')
        .select('*')
        .eq('exam_id', examId)
        .order('total_occurrences', { ascending: false })
        .limit(5);

    const { data: items } = await supabase
        .from('vw_item_health')
        .select('*')
        .eq('exam_id', examId);

    const { data: cohort } = await supabase
        .from('vw_cohort_radar')
        .select('*')
        .eq('exam_id', examId);

    return {
        pathologyRanking: (pathology as PathologyRankingRow[] || []).map(p => ({
            competencyId: p.competency_id,
            state: p.state,
            count: p.total_occurrences,
            avgConfidence: p.avg_confidence_score
        })),
        itemHealth: (items as ItemHealthRow[] || []).map(i => ({
            questionId: i.question_id,
            accuracy: i.accuracy_rate,
            medianTime: i.median_time_ms,
            status: i.health_status
        })),
        cohortRadar: (cohort as CohortRadarRow[] || []).map(c => ({
            studentId: c.student_id,
            score: c.overall_score,
            ece: c.ece_score,
            archetype: c.student_archetype
        }))
    };
}
