"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";

export interface StudentLatestDiagnostic {
    attemptId: string;
    studentId: string;
    examId: string;
    examTitle: string;
    completedAt: string;
    diagnosticResult: {
        competencyDiagnoses: Array<{
            competencyId: string;
            state: 'MASTERED' | 'GAP' | 'MISCONCEPTION' | 'UNKNOWN';
            evidence: {
                reason: string;
                confidenceScore: number;
                timeMs: number;
                hesitationCount: number;
            };
        }>;
        calibration: {
            certaintyAverage: number;
            accuracyAverage: number;
            blindSpots: number;
            fragileKnowledge: number;
            eceScore: number;
        };
        overallScore: number;
    };
    appliedMutations?: any[];
}

/**
 * Fetches the latest diagnostic result for a student.
 * Used by TacticalStudentBridge to render the Cognitive Digital Twin.
 */
export async function getStudentLatestDiagnostic(studentId: string): Promise<StudentLatestDiagnostic | null> {
    await validateAdmin();
    const supabase = await createClient();

    // Fetch the most recent completed exam attempt for this student
    const { data: attempts, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select(`
            id,
            learner_id,
            exam_config_id,
            results_cache,
            applied_mutations,
            completed_at,
            exams:exam_config_id (
                id,
                title
            )
        `)
        .eq('learner_id', studentId)
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false })
        .limit(1);

    if (attemptsError || !attempts || attempts.length === 0) {
        console.error('Error fetching student diagnostic:', attemptsError);
        return null;
    }

    const attempt = attempts[0];
    const resultsCache = attempt.results_cache as any;

    if (!resultsCache) {
        return null;
    }

    return {
        attemptId: attempt.id,
        studentId: attempt.learner_id,
        examId: attempt.exam_config_id,
        examTitle: (attempt.exams as any)?.title || 'Evaluación sin título',
        completedAt: attempt.completed_at,
        diagnosticResult: {
            competencyDiagnoses: resultsCache.competencyDiagnoses || [],
            calibration: resultsCache.calibration || {
                certaintyAverage: 0,
                accuracyAverage: 0,
                blindSpots: 0,
                fragileKnowledge: 0,
                eceScore: 0
            },
            overallScore: resultsCache.overallScore || 0
        },
        appliedMutations: attempt.applied_mutations || []
    };
}
