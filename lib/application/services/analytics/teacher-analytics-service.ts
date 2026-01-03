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
        // 1. Fetch Cohort Radar (Now includes Forensic Archetypes)
        const radarQuery = this.supabase
            .from('vw_cohort_radar')
            .select('*')
            .eq('teacher_id', teacherId);

        // 2. Fetch Pathology Ranking (Misconceptions)
        const pathologyQuery = this.supabase
            .from('vw_pathology_ranking')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('total_occurrences', { ascending: false })
            .limit(5);

        // 3. Fetch Equity Audit (Bias Monitor)
        const equityQuery = this.supabase
            .from('vw_remediation_fairness')
            .select('*')
            .eq('teacher_id', teacherId);

        if (examId) {
            radarQuery.eq('exam_id', examId);
            pathologyQuery.eq('exam_id', examId);
            equityQuery.eq('exam_id', examId);
        }

        const [radarResponse, pathologyResponse, equityResponse] = await Promise.all([
            radarQuery,
            pathologyQuery,
            equityQuery
        ]);

        const cohortRadar: CohortMember[] = (radarResponse.data || []).map((row: CohortRadarRow) => ({
            studentId: row.student_id,
            examId: row.exam_id,
            overallScore: row.overall_score || 0,
            eceScore: row.ece_score || 0,
            studentArchetype: row.student_archetype || 'DEVELOPING',
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

        // @ts-ignore - Adding equity data to result for the Forensic Command Center
        const equityAudit = equityResponse.data || [];

        return {
            cohortRadar,
            pathologyRanking,
            // @ts-ignore
            equityAudit
        };
    }
}
