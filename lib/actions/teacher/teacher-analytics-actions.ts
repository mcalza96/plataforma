'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { getUserId } from '@/lib/infrastructure/auth-utils';

/**
 * Representa un estudiante en el radar de la cohorte
 */
export interface CohortMember {
    studentId: string;
    examId: string;
    overallScore: number;
    eceScore: number;
    studentArchetype: 'MASTER' | 'IMPULSIVE' | 'ANXIOUS' | 'STRATEGIC' | string;
    isImpulsive: boolean;
    isAnxious: boolean;
}

/**
 * Representa una "patología" detectada en el examen
 */
export interface Pathology {
    competencyId: string;
    state: string;
    totalOccurrences: number;
    avgConfidenceScore: number;
    avgHesitationIndex: number;
    reason: string;
}

/**
 * Resultado unificado de analíticas para el profesor
 */
export interface TeacherAnalyticsResult {
    cohortRadar: CohortMember[];
    pathologyRanking: Pathology[];
}

/**
 * Obtiene analíticas avanzadas para el dashboard del profesor (Gestión Táctica de Aula)
 * 
 * @param examId Filtro opcional por ID de examen
 * @returns Datos de analíticas o null si hay error de autenticación
 */
export async function getTeacherAnalytics(examId?: string): Promise<TeacherAnalyticsResult | null> {
    try {
        // 1. Auth Check - Tenant Isolation
        const teacherId = await getUserId();
        if (!teacherId) {
            console.error('[getTeacherAnalytics] Error: Usuario no autenticado');
            return null;
        }

        const supabase = await createClient();

        // 2. Parallel Fetching (Promise.all) de ambas vistas con filtros
        const queries = [
            // Consulta a vw_cohort_radar
            supabase
                .from('vw_cohort_radar')
                .select('*')
                .eq('teacher_id', teacherId),

            // Consulta a vw_pathology_ranking (Top 5 por ocurrencias)
            supabase
                .from('vw_pathology_ranking')
                .select('*')
                .eq('teacher_id', teacherId)
                .order('total_occurrences', { ascending: false })
                .limit(5)
        ];

        // Añadir filtro opcional por examId
        if (examId) {
            // @ts-ignore - Supabase types might not include views by default if not updated
            queries[0] = queries[0].eq('exam_id', examId);
            // @ts-ignore
            queries[1] = queries[1].eq('exam_id', examId);
        }

        const [radarResponse, pathologyResponse] = await Promise.all(queries);

        // 3. Transformation & Return

        // Manejo de errores de Supabase silencioso
        if (radarResponse.error) {
            console.error('[getTeacherAnalytics] Error fetching vw_cohort_radar:', radarResponse.error);
        }
        if (pathologyResponse.error) {
            console.error('[getTeacherAnalytics] Error fetching vw_pathology_ranking:', pathologyResponse.error);
        }

        const cohortRadar: CohortMember[] = (radarResponse.data || []).map((row: any) => ({
            studentId: row.student_id,
            examId: row.exam_id,
            overallScore: row.overall_score,
            eceScore: row.ece_score,
            studentArchetype: row.student_archetype,
            isImpulsive: row.is_impulsive,
            isAnxious: row.is_anxious,
        }));

        const pathologyRanking: Pathology[] = (pathologyResponse.data || []).map((row: any) => ({
            competencyId: row.competency_id,
            state: row.state,
            totalOccurrences: row.total_occurrences,
            avgConfidenceScore: row.avg_confidence_score,
            avgHesitationIndex: row.avg_hesitation_index,
            reason: row.reason,
        }));

        return {
            cohortRadar,
            pathologyRanking
        };

    } catch (error) {
        console.error('[getTeacherAnalytics] Unexpected error:', error);
        return {
            cohortRadar: [],
            pathologyRanking: []
        };
    }
}
