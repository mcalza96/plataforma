import { SupabaseClient } from '@supabase/supabase-js';
import {
    TeacherAnalyticsResult,
    CohortRadarRow,
    PathologyRankingRow,
    CohortMember,
    Pathology
} from '@/lib/domain/analytics-types';

export class TeacherAnalyticsService {
    constructor(private supabase: SupabaseClient) { }

    async getTeacherAnalytics(teacherId: string, examId?: string): Promise<TeacherAnalyticsResult> {
        const queries = [
            this.supabase
                .from('vw_cohort_radar')
                .select('*')
                .eq('teacher_id', teacherId),

            this.supabase
                .from('vw_pathology_ranking')
                .select('*')
                .eq('teacher_id', teacherId)
                .order('total_occurrences', { ascending: false })
                .limit(5)
        ];

        if (examId) {
            // @ts-ignore
            queries[0] = queries[0].eq('exam_id', examId);
            // @ts-ignore
            queries[1] = queries[1].eq('exam_id', examId);
        }

        const [radarResponse, pathologyResponse] = await Promise.all(queries);

        const cohortRadar: CohortMember[] = (radarResponse.data || []).map((row: CohortRadarRow) => ({
            studentId: row.student_id,
            examId: row.exam_id,
            overallScore: row.overall_score,
            eceScore: row.ece_score,
            studentArchetype: row.student_archetype,
            isImpulsive: !!row.is_impulsive,
            isAnxious: !!row.is_anxious,
        }));

        const pathologyRanking: Pathology[] = (pathologyResponse.data || []).map((row: PathologyRankingRow) => ({
            competencyId: row.competency_id,
            state: row.state,
            totalOccurrences: row.total_occurrences,
            avgConfidenceScore: row.avg_confidence_score,
            avgHesitationIndex: row.avg_hesitation_index || 0,
            reason: row.reason || '',
        }));

        return {
            cohortRadar,
            pathologyRanking
        };
    }
}
