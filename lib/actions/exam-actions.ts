"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers } from "next/headers";

export async function publishExam(config: { title: string; matrix: any; questions?: any[] }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Capture the current "Snapshot" of the builder's questions or generate them
    // If questions aren't provided, use a default map based on matrix concepts
    const finalQuestions = config.questions?.length ? config.questions : (config.matrix?.concepts || []).map((c: any) => ({
        id: crypto.randomUUID(),
        type: 'CBM',
        stem: `Diagnóstico sobre: ${c.name}`,
        options: [
            { id: 'opt-a', text: 'Opción Correcta', isCorrect: true },
            { id: 'opt-b', text: 'Distractor Común', isCorrect: false },
            { id: 'opt-c', text: 'No lo sé / No estoy seguro', isCorrect: false, isGap: true }
        ],
        competencyId: c.id
    }));

    // Save the exam configuration
    const { data, error } = await supabase
        .from("exams")
        .insert({
            title: config.title,
            creator_id: user.id,
            config_json: config.matrix, // The topography (concepts, misconceptions)
            questions: finalQuestions,     // The actual probes (Question[])
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

    // 1. Mark as completed and get final state + exam config
    const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .update({
            status: "COMPLETED",
            finished_at: new Date().toISOString()
        })
        .eq("id", attemptId)
        .eq("learner_id", user.id)
        .select("*, exams(config_json, questions)")
        .single();

    if (attemptError || !attempt) {
        console.error("Failed to finalize attempt:", attemptError);
        return { success: false, error: "Attempt not found or unauthorized" };
    }

    const examData = attempt.exams;

    // 2. Fetch all telemetry for this attempt from the Forensic Log (telemetry_logs)
    const { data: logs, error: logError } = await supabase
        .from("telemetry_logs")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("timestamp", { ascending: true });

    if (logError) {
        console.error("Failed to fetch telemetry logs:", logError);
        return { success: false, error: "Failed to process evaluation evidence" };
    }

    // 3. Prepare data for the Evaluation Engine
    const { evaluateSession } = await import("@/lib/domain/evaluation/inference-engine");

    // Map Snapshot + Logs to StudentResponse[]
    const questions = (examData.questions || []) as any[];
    const responses: any[] = questions.map(q => {
        const studentValue = attempt.current_state[q.id];

        // Find logs for this question
        const qLogs = logs?.filter(l => l.payload.questionId === q.id) || [];
        const answerLog = [...qLogs].reverse().find(l => l.event_type === 'ANSWER_UPDATE');

        const isCorrect = q.options?.find((o: any) => o.id === studentValue)?.isCorrect || false;

        return {
            questionId: q.id,
            selectedOptionId: studentValue || 'none',
            isCorrect: isCorrect,
            confidence: answerLog?.payload?.telemetry?.confidence || 'NONE',
            telemetry: {
                timeMs: answerLog?.payload?.telemetry?.timeMs || 0,
                hesitationCount: qLogs.filter(l => l.event_type === 'HESITATION').length,
                hoverTimeMs: 0, // Not explicitly tracked yet in this version
            }
        };
    });

    // 4. Build Q-Matrix Mapping from Exam Topology
    // We map each question back to its competency and misconception
    const qMatrix: any[] = questions.map(q => {
        // Find if this question is a "trap" for a misconception
        const misconception = examData.config_json?.misconceptions?.find((m: any) =>
            m.description.includes(q.stem) || q.options?.some((o: any) => o.id === m.trapOptionId)
        );

        return {
            questionId: q.id,
            competencyId: q.competencyId || 'generic',
            isTrap: !!misconception,
            trapOptionId: misconception?.trapOptionId || q.options?.find((o: any) => !o.isCorrect && !o.isGap)?.id,
            idDontKnowOptionId: q.options?.find((o: any) => o.isGap)?.id
        };
    });

    // 5. Run Evaluation
    const result = evaluateSession(attemptId, user.id, responses, qMatrix);

    // 6. Save results to cache (White Box Diagnostic)
    const { error: updateError } = await supabase
        .from("exam_attempts")
        .update({ results_cache: result })
        .eq("id", attemptId);

    if (updateError) {
        console.error("Failed to cache results:", updateError);
    }

    return { success: true };
}
