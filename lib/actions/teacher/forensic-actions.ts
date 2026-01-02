"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { calculateRTE, calculateTemporalEntropy } from "@/lib/domain/evaluation/behavior-detector";

export interface ForensicQuestionData {
    questionId: string;
    stem: string;
    selectedOptionId: string;
    isCorrect: boolean;
    confidence: string;
    telemetry: {
        timeMs: number;
        expectedTime: number;
        rte: number;
        hesitationIndex: number;
        isRapidGuessing: boolean;
    };
    diagnosis: {
        state: string;
        reason: string;
    };
}

export interface ForensicSessionBreakdown {
    attemptId: string;
    learnerId: string;
    overallScore: number;
    calibration: any;
    behaviorProfile: any;
    questions: ForensicQuestionData[];
}

export async function getForensicSessionBreakdown(attemptId: string): Promise<ForensicSessionBreakdown | null> {
    const supabase = await createClient();

    // 1. Fetch Attempt and Logs in parallel
    const [attemptRes, logsRes] = await Promise.all([
        supabase.from("exam_attempts").select("*").eq("id", attemptId).single(),
        supabase.from("telemetry_logs").select("*").eq("attempt_id", attemptId).order("timestamp", { ascending: true })
    ]);

    if (attemptRes.error || !attemptRes.data) return null;
    const attempt = attemptRes.data;
    const logs = logsRes.data || [];

    const resultsCache = attempt.results_cache || {};
    const configSnapshot = attempt.config_snapshot || {};
    const questions = configSnapshot.questions || [];
    const currentState = attempt.current_state || {};

    // 2. Process each question
    const processedQuestions: ForensicQuestionData[] = questions.map((q: any) => {
        const questionId = q.id;
        const selectedOptionId = currentState[questionId] || 'none';

        // Find diagnosis for this specific competency/question
        // Note: diagnoses are per competency, but we can find the one that includes this questionId
        const diagnosis = resultsCache.competencyDiagnoses?.find((d: any) =>
            d.evidence.sourceQuestionIds.includes(questionId)
        ) || { state: 'UNKNOWN', reason: 'No se encontró diagnóstico clínico' };

        // Process logs for this question
        const qLogs = logs.filter((l: any) => l.payload.questionId === questionId);
        const lastAnswerLog = [...qLogs].reverse().find((l: any) => l.event_type === 'ANSWER_UPDATE');

        // RTE Calculation
        const timeMs = lastAnswerLog?.payload?.telemetry?.timeMs || 0;
        const expectedTime = q.expected_time_seconds || 60;
        const rte = calculateRTE(timeMs, expectedTime) || 0;
        const isRapidGuessing = rte < 0.3;

        // Hesitation calculation (Temporal Entropy)
        const hesitationCount = qLogs.filter((l: any) => l.event_type === 'HESITATION').length;
        // In this platform, re-selection also counts as hesitation in the entropy formula
        const revisitCount = qLogs.filter((l: any) => l.event_type === 'ANSWER_UPDATE').length - 1;
        const h_i = calculateTemporalEntropy(hesitationCount, Math.max(0, revisitCount));

        // Correctness check
        const selectedOption = q.options?.find((o: any) => o.id === selectedOptionId);
        const isCorrect = selectedOption?.isCorrect === true;

        return {
            questionId,
            stem: q.stem,
            selectedOptionId,
            isCorrect,
            confidence: lastAnswerLog?.payload?.telemetry?.confidence || 'NONE',
            telemetry: {
                timeMs,
                expectedTime,
                rte,
                hesitationIndex: h_i,
                isRapidGuessing
            },
            diagnosis: {
                state: diagnosis.state,
                reason: diagnosis.evidence?.reason || diagnosis.reason
            }
        };
    });

    return {
        attemptId: attempt.id,
        learnerId: attempt.learner_id,
        overallScore: resultsCache.overallScore || 0,
        calibration: resultsCache.calibration || {},
        behaviorProfile: resultsCache.behaviorProfile || {},
        questions: processedQuestions
    };
}

export async function getLatestCompletedAttempt(learnerId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("learner_id", learnerId)
        .eq("status", "COMPLETED")
        .order("finished_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return data.id;
}
