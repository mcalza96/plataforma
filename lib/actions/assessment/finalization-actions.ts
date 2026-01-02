"use server";

import { createClient, createServiceRoleClient } from "@/lib/infrastructure/supabase/supabase-server";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { headers, cookies } from "next/headers";
import { AssessmentService } from "@/lib/application/services/assessment/assessment-service";

export async function finalizeAttempt(attemptId: string, finalSnapshot: Record<string, any> = {}) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    // Auth & Rate Limit Checks
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "anonymous";
    const rateLimit = await checkRateLimit(ip, 'finalization');

    if (!rateLimit.success) {
        return { success: false, error: "Please wait before trying again.", retryAfter: rateLimit.reset };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    const serviceSupabase = await createServiceRoleClient();

    // Security Audit
    const { data: attempt } = await serviceSupabase.from("exam_attempts").select("learner_id").eq("id", attemptId).single();
    if (!attempt) return { success: false, error: "Attempt not found" };

    const isOwner = attempt.learner_id === user.id;
    const isProxy = learnerId && attempt.learner_id === learnerId;

    if (!isOwner && !isProxy && !isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const assessmentService = new AssessmentService(serviceSupabase);
        await assessmentService.finalizeAttempt(attemptId, attempt.learner_id, finalSnapshot);
        return { success: true };
    } catch (error: any) {
        console.error("[finalizeAttempt] Error:", error);
        return { success: false, error: error.message || "Failed to finalize" };
    }
}
