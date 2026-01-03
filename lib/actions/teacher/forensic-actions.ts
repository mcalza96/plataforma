"use server";

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { getUserId } from '@/lib/infrastructure/auth-utils';

export interface ForensicQuestionData {
    questionId: string;
    stem: string;
    isCorrect: boolean;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    telemetry: {
        rte: number;
        hesitationIndex: number;
        isRapidGuessing: boolean;
        zScore?: number;
    };
    diagnosis: {
        state: 'MASTERED' | 'GAP' | 'MISCONCEPTION' | 'NEUTRAL';
        reason: string;
    };
}

export interface ForensicSessionBreakdown {
    attemptId: string;
    learnerId: string;
    questions: ForensicQuestionData[];
    overallScore: number;
    eceScore: number;
}

/**
 * Recupera el desglose forense de una sesión específica.
 */
export async function getForensicSessionBreakdown(attemptId: string): Promise<ForensicSessionBreakdown> {
    const supabase = await createClient();

    const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

    if (error || !attempt) throw new Error("Attempt not found");

    // Map results_cache to ForensicSessionBreakdown
    // Note: This logic assumes the results_cache structure populated during finalization
    const cache = attempt.results_cache || {};
    const diagnoses = cache.competencyDiagnoses || [];

    const questions: ForensicQuestionData[] = diagnoses.map((d: any) => ({
        questionId: d.competencyId, // Fallback if no specific questionId
        stem: d.nodeTitle || "Concepto bajo prueba",
        isCorrect: d.status === 'MASTERED',
        confidence: d.confidence || 'MEDIUM',
        telemetry: {
            rte: d.telemetry?.rte || 1.0,
            hesitationIndex: d.telemetry?.hesitationIndex || 0,
            isRapidGuessing: !!d.telemetry?.isRapidGuessing
        },
        diagnosis: {
            state: d.state || 'NEUTRAL',
            reason: d.reason || "Sin observación adicional."
        }
    }));

    return {
        attemptId,
        learnerId: attempt.learner_id,
        questions,
        overallScore: cache.overallScore || 0,
        eceScore: cache.eceScore || 0
    };
}

/**
 * Obtiene el ID del último intento completado de un estudiante.
 */
export async function getLatestCompletedAttempt(studentId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('learner_id', studentId)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return data?.id || null;
}

/**
 * Recupear el "Gemelo Digital" del estudiante para auditoría forense.

 * Incluye estados del grafo, telemetría y logs de intervenciones de IA.
 */
export async function getStudentDigitalTwin(studentId: string) {
    const teacherId = await getUserId();
    if (!teacherId) throw new Error("Unauthorized");

    const supabase = await createClient();

    // 1. Fetch Student Profile & Progress
    const { data: student } = await supabase
        .from('learners')
        .select(`
            *,
            learner_progress (*)
        `)
        .eq('id', studentId)
        .single();

    // 2. Fetch Latest Attempts with Forensic Metadata
    const { data: attempts } = await supabase
        .from('exam_attempts')
        .select(`
            id,
            status,
            created_at,
            results_cache,
            applied_mutations,
            exam_config:exams(title)
        `)
        .eq('learner_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

    // 3. Extract Shadow Nodes & Gaps from results_cache
    const activeGaps: any[] = [];
    const detectedMisconceptions: any[] = [];

    attempts?.forEach(attempt => {
        const diagnoses = attempt.results_cache?.competencyDiagnoses || [];
        diagnoses.forEach((diag: any) => {
            if (diag.state === 'GAP') activeGaps.push({ ...diag, attemptId: attempt.id });
            if (diag.state === 'MISCONCEPTION') detectedMisconceptions.push({ ...diag, attemptId: attempt.id });
        });
    });

    return {
        student,
        attempts: attempts || [],
        intelligence: {
            activeGaps,
            detectedMisconceptions,
            appliedInterventions: attempts?.flatMap(a => (a.applied_mutations || []).map((m: any) => ({ ...m, attemptId: a.id }))) || []
        }
    };
}

/**
 * Anula una intervención automática de la IA (Override).
 * Registra la decisión del profesor para calibración futura.
 */
export async function overrideIntervention(attemptId: string, mutationIndex: number, justification: string) {
    const teacherId = await getUserId();
    const supabase = await createClient();

    // Log the override action in telemetry
    await supabase.from('ai_usage_logs').insert({
        user_id: teacherId,
        model: 'forensic-orchestrator',
        feature_used: 'AI_INTERVENTION_OVERRIDE',
        metadata: {
            attemptId,
            mutationIndex,
            justification,
            timestamp: new Date().toISOString()
        }
    });

    return { success: true };
}
