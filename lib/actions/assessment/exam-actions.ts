"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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

    // 3. Auto-assign to all students of the teacher
    try {
        const { getStudentRepository } = await import("@/lib/infrastructure/di");
        const studentRepo = getStudentRepository();
        const students = await studentRepo.getStudentsByTeacherId(user.id);

        if (students.length > 0) {
            const assignments = students.map(student => ({
                exam_id: data.id,
                student_id: student.id
            }));

            const { error: assignError } = await supabase
                .from("exam_assignments")
                .insert(assignments);

            if (assignError) {
                console.warn("Failed to auto-assign exam to students:", assignError);
                // We don't fail the whole operation if assignment fails, but we log it
            }
        }
    } catch (repoError) {
        console.error("Error during auto-assignment phase:", repoError);
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

    // 1. Mark as completed and get final state + snapshot
    const { createServiceRoleClient } = await import("@/lib/infrastructure/supabase/supabase-server");
    const serviceSupabase = await createServiceRoleClient();

    const { data: attempt, error: attemptError } = await serviceSupabase
        .from("exam_attempts")
        .update({
            status: "COMPLETED",
            finished_at: new Date().toISOString()
        })
        .eq("id", attemptId)
        .eq("learner_id", user.id) // Security check: must belong to the user
        .select("*")
        .single();

    if (attemptError || !attempt) {
        console.error("Failed to finalize attempt:", attemptError);
        return { success: false, error: "Attempt not found or unauthorized" };
    }

    const examData = attempt.config_snapshot; // Use the Snapshot!

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
        const misconception = examData.matrix?.misconceptions?.find((m: any) =>
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

export async function toggleExamAssignment(examId: string, studentId: string, isActive: boolean) {
    const supabase = await createClient();

    if (isActive) {
        // Assign logic
        const { error } = await supabase
            .from('exam_assignments')
            .upsert({ exam_id: examId, student_id: studentId, status: 'ASSIGNED' });

        if (error) throw new Error(error.message);
    } else {
        // Unassign logic (soft delete or status change)
        const { error } = await supabase
            .from('exam_assignments')
            .delete()
            .match({ exam_id: examId, student_id: studentId });

        if (error) throw new Error(error.message);
    }

    revalidatePath('/admin/exams');
    return { success: true };
}
