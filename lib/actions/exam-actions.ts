"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers } from "next/headers";

export async function publishExam(config: any) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Save the exam configuration
    const { data, error } = await supabase
        .from("exams")
        .insert({
            title: config.title,
            creator_id: user.id,
            config_json: config.matrix, // The topography (concepts, misconceptions)
            questions: config.questions || [], // The generated Lego props
            status: "PUBLISHED",
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to publish exam:", error);
        return { success: false, error: error.message };
    }

    return {
        success: true,
        examId: data.id,
        url: `/assessment/${data.id}`
    };
}

export async function finalizeAttempt(attemptId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // 0. Rate Limit Check (Strict for Finalization)
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "anonymous";
    const rateLimit = await checkRateLimit(ip, 'finalization');

    if (!rateLimit.success) {
        return {
            success: false,
            error: "Please wait a moment before trying to finalize again.",
            retryAfter: rateLimit.reset
        };
    }

    // 1. Mark as completed and get final state
    const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .update({
            status: "COMPLETED",
            finished_at: new Date().toISOString()
        })
        .eq("id", attemptId)
        .eq("learner_id", user.id)
        .select("*, exams(config_json)")
        .single();

    if (attemptError || !attempt) {
        console.error("Failed to finalize attempt:", attemptError);
        return { success: false, error: "Attempt not found or unauthorized" };
    }

    // 2. Fetch all telemetry for this attempt to build StudentResponse[]
    const { data: telemetry, error: telError } = await supabase
        .from("telemetry_events")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("timestamp", { ascending: true });

    if (telError) {
        console.error("Failed to fetch telemetry:", telError);
        return { success: false, error: "Failed to process evaluation evidence" };
    }

    // 3. Prepare data for the Evaluation Engine
    const { evaluateSession } = await import("@/lib/domain/evaluation/inference-engine");

    // Map current_state (snapshot) and telemetry to StudentResponse
    // For simplicity, we'll use the final snapshot responses combined with cumulative telemetry
    const responses: any[] = Object.entries(attempt.current_state || {}).map(([qId, value]: [string, any]) => {
        // Find latest telemetry for this question to get hesitation/time
        const questionEvents = telemetry?.filter(e => e.payload.questionId === qId) || [];
        const lastAnswerEvent = [...questionEvents].reverse().find(e => e.event_type === 'ANSWER_UPDATE');

        return {
            questionId: qId,
            selectedOptionId: value,
            isCorrect: true, // This should be checked against the correct answer in a real app
            confidence: lastAnswerEvent?.payload?.telemetry?.confidence || 'NONE',
            telemetry: {
                timeMs: lastAnswerEvent?.payload?.telemetry?.timeMs || 0,
                hesitationCount: questionEvents.filter(e => e.event_type === 'HESITATION').length,
                hoverTimeMs: 0,
            }
        };
    });

    // 4. Run Evaluation
    // Note: QMatrixMapping needs to be derived from exam config
    const qMatrix: any[] = (attempt.exams?.config_json?.concepts || []).flatMap((c: any) =>
        (c.questions || []).map((qId: string) => ({
            questionId: qId,
            competencyId: c.id,
            isTrap: false,
        }))
    );

    const result = evaluateSession(attemptId, user.id, responses, qMatrix);

    // 5. Save results to cache
    const { error: updateError } = await supabase
        .from("exam_attempts")
        .update({ results_cache: result })
        .eq("id", attemptId);

    if (updateError) {
        console.error("Failed to cache results:", updateError);
    }

    return { success: true };
}
