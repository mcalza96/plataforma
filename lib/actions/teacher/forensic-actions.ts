'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

export interface ForensicQuestionData {
    questionId: string;
    stem: string;
    telemetry: {
        rte: number;
        hesitationIndex: number;
        isRapidGuessing: boolean;
    };
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    diagnosis: {
        state: string;
        reason: string;
    };
    isCorrect: boolean;
}

export interface ForensicSessionBreakdown {
    attemptId: string;
    questions: ForensicQuestionData[];
}

/**
 * Obtiene el intento más reciente completado por un alumno.
 */
export async function getLatestCompletedAttempt(studentId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('learner_id', studentId)
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return data.id;
}

/**
 * Genera un desglose forense detallado de una sesión de examen.
 */
export async function getForensicSessionBreakdown(attemptId: string): Promise<ForensicSessionBreakdown | null> {
    const supabase = await createClient();

    // 1. Fetch Attempt Data
    const { data: attempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .select(`
            id,
            results_cache,
            telemetry_batch
        `)
        .eq('id', attemptId)
        .single();

    if (attemptError || !attempt) {
        console.error("[getForensicSessionBreakdown] Error:", attemptError);
        return null;
    }

    const results = attempt.results_cache || {};
    const telemetryBatch = attempt.telemetry_batch || [];
    const diagnoses = results.competencyDiagnoses || [];
    const answers = results.answers || [];

    // 2. Fetch Question Stems
    const questionIds = answers.map((a: any) => a.questionId);
    const { data: questionsData } = await supabase
        .from('questions')
        .select('id, stem')
        .in('id', questionIds);

    const stemMap = new Map(questionsData?.map(q => [q.id, q.stem]));

    // 3. Assemble Questions Data
    const questions: ForensicQuestionData[] = answers.map((ans: any) => {
        const tel = telemetryBatch.find((t: any) => t.questionId === ans.questionId) || {};
        const diag = diagnoses.find((d: any) => d.competencyId === ans.competencyId) || { state: 'NEUTRAL', reason: 'Sin diagnóstico' };

        return {
            questionId: ans.questionId,
            stem: stemMap.get(ans.questionId) || 'Pregunta no encontrada',
            telemetry: {
                rte: tel.rte || 0,
                hesitationIndex: tel.hesitationIndex || tel.hesitation_index || 0,
                isRapidGuessing: tel.isRapidGuessing ?? (tel.rte < 0.3)
            },
            confidence: ans.confidence || 'MEDIUM',
            diagnosis: {
                state: diag.state,
                reason: diag.evidence?.reason || diag.reason || diag.state
            },
            isCorrect: ans.isCorrect
        };
    });

    return {
        attemptId: attempt.id,
        questions
    };
}
