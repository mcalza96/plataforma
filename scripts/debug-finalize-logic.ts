
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '../lib/infrastructure/rate-limit'; // Assuming this is pure or we mock it locally if needed
import { evaluateSession } from '../lib/domain/evaluation/inference-engine';

// Init Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const serviceSupabase = createClient(supabaseUrl, supabaseKey);

// MOCK CONTEXT
const START_TIME = Date.now();
const USER_ID = 'test-user-id';
const LEARNER_ID = 'test-learner-id';

async function verifyLogicIsolated() {
    console.log("🚀 Starting Isolated Logic Verification...");

    // 1. Fetch Attempt
    const { data: attempts } = await serviceSupabase
        .from("exam_attempts")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);

    if (!attempts || attempts.length === 0) return console.error("❌ No attempts found");
    const attempt = attempts[0];
    const attemptId = attempt.id;
    console.log(`Testing Attempt: ${attemptId}`);

    // 2. Prepare Snapshot
    const questions = attempt.config_snapshot?.questions || [];
    const mockSnapshot: Record<string, string> = {};
    questions.forEach((q: any) => {
        if (q.options?.length > 0) mockSnapshot[q.id] = q.options[0].id; // Force answer
    });

    console.log(`📦 Mock Snapshot: ${Object.keys(mockSnapshot).length} items`);

    // 3. LOGIC UNDER TEST (Copied from exam-actions.ts)
    const finalSnapshot = mockSnapshot; // passed arg

    // Telemetry Fetch
    const { data: logs } = await serviceSupabase
        .from("telemetry_logs")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("timestamp", { ascending: true });

    // State Reconstruction
    let state = { ...(attempt.current_state || {}) };
    if (finalSnapshot && Object.keys(finalSnapshot).length > 0) {
        console.log("🛡️ Logic Branch: Client Snapshot");
        state = { ...state, ...finalSnapshot };
    }

    // Mapping
    try {
        console.log("⚡ Starting Response Mapping...");
        const responses = questions.map((q: any) => { // Added type annotation to q
            const studentValue = state[q.id];
            const qLogs = logs?.filter((l: any) => l.payload.questionId === q.id) || [];
            const answerLog = [...qLogs].reverse().find((l: any) => l.event_type === 'ANSWER_UPDATE');

            const selectedOption = q.options?.find((o: any) => o.id === studentValue);
            const isCorrect = selectedOption?.isCorrect === true;

            // SUSPECT LINE: Synthetic Injection
            // timeMs: answerLog?.payload?.telemetry?.timeMs || (finalSnapshot ? (q.expected_time_seconds || 60) * 1000 : 0)
            const syntheticTime = (q.expected_time_seconds || 60) * 1000;
            const timeMs = answerLog?.payload?.telemetry?.timeMs || (finalSnapshot ? syntheticTime : 0);

            return {
                questionId: q.id,
                selectedOptionId: studentValue || 'none',
                isCorrect: isCorrect,
                confidence: 'NONE',
                telemetry: {
                    timeMs: timeMs,
                    expectedTime: q.expected_time_seconds || 60,
                    hesitationCount: 0,
                    hoverTimeMs: 0
                }
            };
        });

        console.log("✅ Mapping Success. Sample Response:", responses[0]);

        // Evaluation
        console.log("⚡ Starting Evaluation...");

        // Build Q-Matrix
        const qMatrix = questions.map((q: any) => ({
            questionId: q.id,
            competencyId: q.competencyId || 'generic',
            isTrap: false,
            trapOptionId: null,
            idDontKnowOptionId: null
        }));

        const result = evaluateSession(attemptId, LEARNER_ID, responses, qMatrix);
        console.log("✅ Evaluation Success. Score:", result.overallScore);

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR IN LOGIC:");
        console.error(error);
        if (error.stack) console.error(error.stack);
    }
}

verifyLogicIsolated();
