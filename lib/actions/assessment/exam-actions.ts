"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers, cookies } from "next/headers";
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
    // We strictly map the Architect's Prototypes to the Assessment's CBM Question format
    // This bridges the "Pedagogical Intent" (Prototype) to "Psychometric Instrument" (Question) context.

    let finalQuestions: any[] = [];

    if (config.questions && config.questions.length > 0) {
        // Transform Prototypes to Questions
        finalQuestions = config.questions.map((proto: any) => ({
            id: proto.id || crypto.randomUUID(),
            type: 'CBM', // Enforce CBM type for diagnostics
            stem: proto.stem,
            // Map 'content' to 'text' and ensure IDs exist
            options: (proto.options || []).map((opt: any, idx: number) => ({
                id: opt.id || `opt-${idx}-${crypto.randomUUID().split('-')[0]}`,
                text: opt.content || opt.text || "Opción sin texto", // Fallback for safety
                isCorrect: opt.isCorrect,
                isGap: opt.isGap || false,
                // Preserve pedagogical metadata for the inference engine
                rationale: opt.rationale || opt.feedback
            })),
            // Persist the reasoning as metadata for the 'TeacherOS' layer
            pedagogicalReasoning: proto.pedagogicalReasoning,
            competencyId: proto.competencyId // Ensure lineage trace
        }));
    } else {
        // FALLBACK: Generate Placeholder Questions from Key Concepts
        const keyConcepts = config.matrix?.keyConcepts || [];

        finalQuestions = keyConcepts.map((c: any) => {
            const conceptName = typeof c === 'string' ? c : (c.name || c.title || 'Concepto Indefinido');
            return {
                id: crypto.randomUUID(),
                type: 'CBM',
                stem: `Diagnóstico sobre: ${conceptName}`,
                options: [
                    { id: 'opt-a', text: 'Opción Correcta (Placeholder)', isCorrect: true },
                    { id: 'opt-b', text: 'Distractor Común (Placeholder)', isCorrect: false },
                    { id: 'opt-c', text: 'No lo sé / No estoy seguro', isCorrect: false, isGap: true }
                ],
                competencyId: typeof c === 'object' ? c.id : undefined
            };
        });
    }

    // Safety: If for some reason we still have 0 questions (e.g. no concepts), generate a generic one
    if (finalQuestions.length === 0) {
        finalQuestions.push({
            id: crypto.randomUUID(),
            type: 'CBM',
            stem: `Evaluación de ${config.title}`,
            options: [
                { id: 'opt-1', text: 'Sí, entiendo', isCorrect: true },
                { id: 'opt-2', text: 'No estoy seguro', isCorrect: false, isGap: true }
            ]
        });
    }

    console.log(`[publishExam] Publishing ${finalQuestions.length} items. Source: ${config.questions?.length ? 'ARCHITECT' : 'FALLBACK'}`);

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

export async function finalizeAttempt(attemptId: string, finalSnapshot?: Record<string, any>) {
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
    // We fetch and update with Service Role to bypass RLS,
    // but we manually enforce that the attempt belongs to this session.
    // Check for Admin Role to bypass strict ownership
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    // 1. Mark as completed and get final state + snapshot
    // We fetch and update with Service Role to bypass RLS.
    // We removed the strict .or() filter to allow Admins to finalize any attempt.
    const { createServiceRoleClient } = await import("@/lib/infrastructure/supabase/supabase-server");
    const serviceSupabase = await createServiceRoleClient();
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    const { data: attempts, error: attemptError } = await serviceSupabase
        .from("exam_attempts")
        .update({
            status: "COMPLETED",
            finished_at: new Date().toISOString()
        })
        .eq("id", attemptId)
        .select("*")
        .limit(1);

    const attempt = attempts?.[0];

    if (attemptError || !attempt) {
        console.error("Failed to finalize attempt:", attemptError);
        return { success: false, error: "Attempt not found" };
    }

    // Explicit Security Check
    const isOwner = attempt.learner_id === user.id;
    const isProxy = learnerId && attempt.learner_id === learnerId;

    if (!isOwner && !isProxy && !isAdmin) {
        return { success: false, error: "Unauthorized: Not your attempt" };
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

    // RECONSTRUCTION PRIORITY:
    // 1. Client Snapshot (Most fresh)
    // 2. DB Snapshot (Stored)
    // 3. Telemetry Logs (Forensic Fallback)

    let state = { ...(attempt.current_state || {}) };

    if (finalSnapshot && Object.keys(finalSnapshot).length > 0) {
        console.log(`[finalizeAttempt] 🛡️ Using Client-Provided Snapshot with ${Object.keys(finalSnapshot).length} answers.`);
        state = { ...state, ...finalSnapshot };

        // SELF-HEALING: Persist this snapshot immediately to ensure DB consistency
        await serviceSupabase
            .from("exam_attempts")
            .update({ current_state: state })
            .eq("id", attemptId);
    } else {
        const answerLogs = logs?.filter(l => l.event_type === 'ANSWER_UPDATE') || [];
        if (Object.keys(state).length === 0 && answerLogs.length > 0) {
            console.warn(`[finalizeAttempt] ⚠️ Attempt ${attemptId} empty. Reconstructing from logs.`);
            answerLogs.forEach(l => {
                if (l.payload.questionId && l.payload.value !== undefined) {
                    state[l.payload.questionId] = l.payload.value;
                }
            });
        }
    }

    const responses: any[] = questions.map(q => {
        const studentValue = state[q.id];

        // Find logs for this question
        const qLogs = logs?.filter(l => l.payload.questionId === q.id) || [];
        const answerLog = [...qLogs].reverse().find(l => l.event_type === 'ANSWER_UPDATE');

        // Robust correctness check: search in the snapshot's options
        const selectedOption = q.options?.find((o: any) => o.id === studentValue);
        const isCorrect = selectedOption?.isCorrect === true; // Strict boolean check

        console.log(`[finalizeAttempt] Evaluated Q: ${q.id}, Value: ${studentValue}, Correct: ${isCorrect}`);

        return {
            questionId: q.id,
            selectedOptionId: studentValue || 'none',
            isCorrect: isCorrect,
            confidence: answerLog?.payload?.telemetry?.confidence || 'NONE',
            telemetry: {
                timeMs: answerLog?.payload?.telemetry?.timeMs || (finalSnapshot ? (q.expected_time_seconds || 60) * 1000 : 0), // Synthetic Injection
                expectedTime: q.expected_time_seconds || 60,
                hesitationCount: qLogs.filter(l => l.event_type === 'HESITATION').length,
                hoverTimeMs: 0,
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
            idDontKnowOptionId: q.options?.find((o: any) => o.isGap === true)?.id // Explicit check for isGap property
        };
    });

    // 5. Run Evaluation
    const targetLearnerId = learnerId || user.id;
    console.log("[finalizeAttempt] Running evaluation for learner:", targetLearnerId);
    const result = evaluateSession(attemptId, targetLearnerId, responses, qMatrix);
    console.log("[finalizeAttempt] Evaluation complete. Score:", result.overallScore);

    // 6. Save results to cache (White Box Diagnostic)
    // We use serviceSupabase to ensure persistence even if RLS is strict
    const { error: updateError } = await serviceSupabase
        .from("exam_attempts")
        .update({ results_cache: result })
        .eq("id", attemptId);

    if (updateError) {
        console.error("[finalizeAttempt] Failed to cache results:", updateError);
    } else {
        console.log("[finalizeAttempt] Results cached successfully.");
    }

    // 7. AUTO-REMEDIATION LOOP (Phase C)
    // We invoke the Triage Orchestrator to apply "Judgement" immediately.
    try {
        const { processAssessmentUseCase } = await import("@/lib/application/use-cases/process-assessment-use-case");
        await processAssessmentUseCase({
            attemptId,
            learnerId: targetLearnerId,
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

export async function deleteExam(examId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Security Check: Only Creator or Admin can delete
    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    // Check Role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (exam.creator_id !== user.id && !isAdmin) {
        return { success: false, error: "Unauthorized: only creator or admin can delete." };
    }

    const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

    if (error) {
        console.error("Failed to delete exam:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/exams');
    return { success: true };
}

export async function updateExamTitle(examId: string, newTitle: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    if (!newTitle || newTitle.trim().length === 0) {
        return { success: false, error: "Title cannot be empty" };
    }

    // Security Check
    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (exam.creator_id !== user.id && !isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('exams')
        .update({ title: newTitle.trim() })
        .eq('id', examId);

    if (error) {
        console.error("Failed to update exam title:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/exams');
    return { success: true };
}
