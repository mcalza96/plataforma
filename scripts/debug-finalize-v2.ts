// Mock Next.js context
import * as headers from 'next/headers';

Object.defineProperty(headers, 'cookies', {
    value: () => ({
        get: (key: string) => {
            if (key === 'learner_id') return { value: 'test-learner-id' };
            return { value: 'test-user-id' };
        },
        getAll: () => [],
    }),
    writable: true
});

Object.defineProperty(headers, 'headers', {
    value: () => ({
        get: () => '127.0.0.1',
    }),
    writable: true
});

import { finalizeAttempt } from '../lib/actions/assessment/exam-actions';
import { createClient } from '../lib/infrastructure/supabase/supabase-server';

async function debugFinalizeWithSnapshot() {
    console.log("🚀 Starting Debug Finalize V2...");

    // 1. Get real attempt ID dynamically
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = (await import('@supabase/supabase-js')).createClient(supabaseUrl, supabaseKey);

    const { data: attempts } = await supabase
        .from("exam_attempts")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);

    if (!attempts || attempts.length === 0) {
        console.error("❌ No attempts found to test.");
        return;
    }

    const attempt = attempts[0];
    const attemptId = attempt.id;
    console.log(`Testing with Attempt ID: ${attemptId}`);

    // 2. Construct a mock snapshot that mimics the frontend payload
    // We'll just grab the keys from the config_snapshot to make valid answers
    const questions = attempt.config_snapshot?.questions || [];
    const mockSnapshot: Record<string, string> = {};

    questions.forEach((q: any, idx: number) => {
        // Pick the first option as the "answer"
        if (q.options && q.options.length > 0) {
            mockSnapshot[q.id] = q.options[0].id;
        }
    });

    console.log(`📦 Generated Mock Snapshot with ${Object.keys(mockSnapshot).length} answers.`);

    // 3. Call finalizeAttempt
    try {
        console.log("⚡ Invoking finalizeAttempt...");
        const result = await finalizeAttempt(attemptId, mockSnapshot);
        console.log("✅ Result:", result);
    } catch (error: any) {
        console.error("❌ CRITICAL ERROR CAUGHT:");
        console.error(error);
        if (error.stack) console.error(error.stack);
    }
}

debugFinalizeWithSnapshot();
