"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import {
    TelemetryBatchSchema,
    TelemetryBatch,
    AnswerUpdatePayload
} from "@/lib/domain/pipeline/types";
import { SupabaseTelemetryRepository } from "@/lib/infrastructure/repositories/telemetry-repository";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers, cookies } from "next/headers";

/**
 * Server Action to submit a batch of telemetry events.
 * Implements the "Double Writing" pattern: 
 * 1. Writes all events to the telemetry_logs log.
 * 2. Updates the exam_attempts snapshot with the latest answers.
 */
export async function submitTelemetryBatch(batch: unknown) {
    // 1. Validation
    const result = TelemetryBatchSchema.safeParse(batch);
    if (!result.success) {
        return { success: false, error: "Invalid telemetry batch format" };
    }

    const validatedBatch = result.data as TelemetryBatch;

    // 1.1 Rate Limit Check
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "anonymous";
    const rateLimit = await checkRateLimit(ip, 'telemetry');

    if (!rateLimit.success) {
        return {
            success: false,
            error: "Too many requests. Your telemetry will be synced shortly.",
            retryAfter: rateLimit.reset
        };
    }

    const supabase = await createClient();
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    // 2. Security Check (Session)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // 3. Ownership Check (Trust but Verify Identity Flow)
    // We use serviceSupabase to bypass RLS for the lookup, and then verify ownership manually.
    const { createServiceRoleClient } = await import("@/lib/infrastructure/supabase/supabase-server");
    const serviceSupabase = await createServiceRoleClient();

    const { data: attempt, error: attemptError } = await serviceSupabase
        .from("exam_attempts")
        .select("learner_id, current_state, metadata")
        .eq("id", validatedBatch.attemptId)
        .single();

    if (attemptError || !attempt) {
        return { success: false, error: "Exam attempt not found" };
    }

    // Check Admin Role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    // Allow if user is the direct owner OR if the current student session matches the owner OR is Admin
    const isOwner = attempt.learner_id === user.id;
    const isCurrentStudent = studentId && attempt.learner_id === studentId;

    if (!isOwner && !isCurrentStudent && !isAdmin) {
        console.warn(`[Telemetry] Forbidden sync attempt. AuthUser: ${user.id}, CookieStudent: ${studentId}, AttemptOwner: ${attempt.learner_id}`);
        return { success: false, error: "Forbidden: Not your exam attempt" };
    }

    // 3.1 Device Detection
    // We capture this once or update it. Useful for sala de maquinas.
    const userAgent = headerList.get("user-agent") || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    // 3.2 Secure Repository Initialization
    // We already have serviceSupabase from above.

    // Update metadata if not set or changed
    const currentMetadata = (attempt.metadata as Record<string, any>) || {};
    if (currentMetadata.deviceType !== deviceType) {
        await serviceSupabase.from("exam_attempts").update({
            metadata: { ...currentMetadata, deviceType, lastUserAgent: userAgent }
        }).eq("id", validatedBatch.attemptId);
    }

    const repository = new SupabaseTelemetryRepository(serviceSupabase);

    try {
        // 4. Double Writing (Divorce Pattern)

        // Step 1: Save ALL events to the forensic log (telemetry_logs)
        await repository.saveBatch(validatedBatch.attemptId, validatedBatch.events);

        // Step 2: Update the "Snapshot" (exam_attempts.current_state)
        // We only care about ANSWER_UPDATE events for the snapshot.
        const answerEvents = validatedBatch.events.filter(e => e.event_type === "ANSWER_UPDATE");

        if (answerEvents.length > 0) {
            // Merge the latest answers from the batch into the existing state
            const stateToUpdate = { ...(attempt.current_state as Record<string, any>) };

            answerEvents.forEach(event => {
                const payload = event.payload as unknown as AnswerUpdatePayload;
                stateToUpdate[payload.questionId] = payload.value;
            });

            await repository.updateSnapshot(validatedBatch.attemptId, stateToUpdate);
        } else {
            // Keep heartbeat by updating last_active_at even if no answers changed
            await repository.updateSnapshot(validatedBatch.attemptId, attempt.current_state as Record<string, any>);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Telemetry processing error:", error);
        return { success: false, error: error.message || "Internal server error" };
    }
}

/**
 * Server Action to fetch the current exam state for hydration.
 */
export async function getExamState(attemptId: string) {
    const supabase = await createClient();
    const repository = new SupabaseTelemetryRepository(supabase);

    return await repository.getExamState(attemptId);
}
