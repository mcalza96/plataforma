"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function publishExam(
    config: { title: string; matrix: any; questions?: any[] },
    assignmentConfig: { mode: 'auto_all' | 'segment'; segmentId?: string } = { mode: 'auto_all' }
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // 1. Readiness Validation (The Bridge Guard)
    const { calculateReadiness } = await import("@/lib/domain/architect");

    // Ensure matrix has the shape of PartialKnowledgeMap
    const readiness = calculateReadiness(config.matrix);

    if (!readiness.isValid) {
        return {
            success: false,
            error: `Diagnostic Readiness Check Failed: ${!readiness.hasTargetAudience ? "Missing Target Audience. " : ""
                }${readiness.conceptCount < 3 ? "Insufficient Concepts (Min 3). " : ""
                }${readiness.misconceptionCount < 1 ? "Insufficient Misconceptions (Min 1). " : ""
                }`
        };
    }

    // 2. Snapshotting & Item Generation
    // If questions aren't provided, we generate the "Standard Probe" set based on the Gold Rule
    const finalQuestions = config.questions?.length
        ? config.questions
        : (config.matrix?.keyConcepts || []).map((c: any) => ({
            id: crypto.randomUUID(),
            type: 'CBM',
            stem: `Diagnóstico sobre: ${c.name || c.title}`,
            options: [
                { id: 'opt-a', text: 'Opción Correcta (Placeholder)', isCorrect: true },
                { id: 'opt-b', text: 'Distractor Común (Placeholder)', isCorrect: false },
                { id: 'opt-c', text: 'No lo sé / No estoy seguro', isCorrect: false, isGap: true }
            ],
            competencyId: c.id
        }));

    console.log(`[publishExam] Using ${config.questions?.length ? 'PROVIDED JSON' : 'FALLBACK PLACEHOLDERS'} for Item Bank. Count: ${finalQuestions.length}`);

    // 3. Immutable Insert (Standalone Aggregate Root)
    const { data, error } = await supabase
        .from("exams")
        .insert({
            title: config.title,
            creator_id: user.id,
            config_json: config.matrix, // The Immutable Topology Snapshot
            questions: finalQuestions,     // The Immutable Item Bank
            status: "PUBLISHED",
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to publish exam:", error);
        return { success: false, error: error.message };
    }

    // 4. Atomic Assignment Logic (Tenant Isolated)
    try {
        if (assignmentConfig.mode === 'auto_all') {
            const { getStudentRepository } = await import("@/lib/infrastructure/di");
            const studentRepo = getStudentRepository();
            const students = await studentRepo.getStudentsByTeacherId(user.id);

            if (students.length > 0) {
                const assignments = students.map(student => ({
                    exam_id: data.id,
                    student_id: student.id,
                    status: 'ASSIGNED',
                    assigned_at: new Date().toISOString(),
                    origin_context: 'standalone' // Explicit Metadata
                }));

                const { error: assignError } = await supabase
                    .from("exam_assignments")
                    .insert(assignments);

                if (assignError) {
                    console.error("CRITICAL: Failed to auto-assign exam:", assignError);
                    // Non-blocking failure, but logged.
                }
            }
        }
    } catch (repoError) {
        console.error("Error during assignment phase:", repoError);
    }

    revalidatePath('/admin/exams');

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

    // 7. AUTO-REMEDIATION LOOP (Phase C)
    // We invoke the Triage Orchestrator to apply "Judgement" immediately.
    try {
        const { processAssessmentUseCase } = await import("@/lib/application/use-cases/process-assessment-use-case");
        await processAssessmentUseCase({
            attemptId,
            learnerId: user.id,
            result
        });
    } catch (triageError) {
        console.error("Error in Remediation Loop:", triageError);
        // We do not fail the request, as assessment is safely saved. 
        // Triage failure is an internal error to be logged/retried.
    }

    return { success: true };
}

export async function toggleExamAssignment(examId: string, studentId: string, isActive: boolean) {
    const supabase = await createClient();

    if (isActive) {
        // Assign logic
        const { error } = await supabase
            .from('exam_assignments')
            .upsert({
                exam_id: examId,
                student_id: studentId,
                status: 'ASSIGNED',
                origin_context: 'standalone' // Explicit metadata for repository filtering
            });

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
