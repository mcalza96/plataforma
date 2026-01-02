"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { CohortRadarRow, PathologyRankingRow, ItemHealthRow } from "@/lib/domain/analytics-types";

export interface CohortAnalytics {
    examTitle: string;
    kpis: {
        participationRate: number;
        averageScore: number;
        atRiskCount: number;
        timeEfficiency: number;
        frictionIndex: number;
        averageECE: number;
        maxRiskConcept: { id: string; title: string; bugCount: number } | null;
    };
    heatMap: {
        studentId: string;
        studentName: string;
        score: number;
        status: 'green' | 'yellow' | 'red';
        topics: { name: string; mastery: number }[];
    }[];
    recommendations: string[];
    frictionNodes: {
        id: string;
        slip: number;
        discrimination: number;
        status: 'OK' | 'CRITICAL' | 'WARNING';
    }[];
}

export async function getCohortAnalytics(examId: string): Promise<CohortAnalytics | null> {
    await validateAdmin();
    const supabase = await createClient();

    const { data: exam } = await supabase
        .from('exams')
        .select('title')
        .eq('id', examId)
        .single();

    if (!exam) return null;

    const [{ data: cohort }, { data: pathologies }, { data: items }] = await Promise.all([
        supabase.from('vw_cohort_radar').select('*, profiles:student_id (display_name)').eq('exam_id', examId),
        supabase.from('vw_pathology_ranking').select('*').eq('exam_id', examId).order('total_occurrences', { ascending: false }).limit(1),
        supabase.from('vw_item_health').select('*').eq('exam_id', examId)
    ]);

    const cohortData = cohort as (CohortRadarRow & { profiles: { display_name: string } })[] || [];
    const avgScore = cohortData.length > 0
        ? cohortData.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / cohortData.length
        : 0;
    const atRiskCount = cohortData.filter(c => c.student_archetype === 'AT_RISK').length;
    const avgECE = cohortData.length > 0
        ? cohortData.reduce((acc, curr) => acc + (curr.ece_score || 0), 0) / cohortData.length
        : 0;

    const maxRisk = (pathologies as PathologyRankingRow[] || [])[0] || null;

    return {
        examTitle: exam.title,
        kpis: {
            participationRate: 100,
            averageScore: avgScore,
            atRiskCount,
            timeEfficiency: 95,
            frictionIndex: 0.4,
            averageECE: avgECE,
            maxRiskConcept: maxRisk ? {
                id: maxRisk.competency_id,
                title: maxRisk.competency_id,
                bugCount: maxRisk.total_occurrences
            } : null
        },
        heatMap: cohortData.map(c => ({
            studentId: c.student_id,
            studentName: c.profiles?.display_name || 'Estudiante',
            score: c.overall_score,
            status: c.overall_score > 80 ? 'green' : c.overall_score > 60 ? 'yellow' : 'red',
            topics: []
        })),
        recommendations: [
            "Analizar los ítems con alto índice de Slip.",
            "Reforzar los conceptos identificados en el Ranking de Patologías."
        ],
        frictionNodes: (items as ItemHealthRow[] || []).map(i => ({
            id: i.question_id,
            slip: i.slip_param || 0,
            discrimination: 0.5,
            status: i.health_status as any
        }))
    };
}
