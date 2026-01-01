
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { calculateRTE, isRapidGuessing } from '../lib/domain/evaluation/behavior-detector';

// Init Supabase Service Role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const serviceSupabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRootCause() {
    console.log("🔍 Starting FORENSIC ANALYSIS...");

    // 1. Fetch Latest Attempt
    const { data: attempts } = await serviceSupabase
        .from("exam_attempts")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);

    if (!attempts || attempts.length === 0) return console.error("❌ No attempts found");
    const attempt = attempts[0];
    const ATTEMPT_ID = attempt.id;

    // 2. Fetch Telemetry
    const { data: logs } = await serviceSupabase
        .from("telemetry_logs")
        .select("*")
        .eq("attempt_id", ATTEMPT_ID)
        .order("timestamp", { ascending: true });

    console.log(`\n📋 Attempt Status: ${attempt.status}`);
    console.log(`📦 Final State Keys: ${Object.keys(attempt.current_state || {}).length}`);
    console.log(`📡 Telemetry logs: ${logs?.length}`);

    // If state is missing, that's the root cause
    if (Object.keys(attempt.current_state || {}).length === 0) {
        console.error("🚨 CRITICAL: Attempt has EMPTY current_state despite snapshot priority!");
    } else {
        console.log("✅ State is present. Checking matching logic...");
    }

    // 3. Simulate Evaluation Loop
    const questions = (attempt.config_snapshot?.questions || []) as any[];

    console.log("\n🧪 SCORING SIMULATION:");

    let score = 0;

    questions.forEach((q: any) => {
        const studentValue = attempt.current_state[q.id];
        const selectedOption = q.options?.find((o: any) => o.id === studentValue);
        const isCorrect = selectedOption?.isCorrect === true;

        // Find Telemetry
        const qLogs = logs?.filter((l: any) => l.payload.questionId === q.id) || [];
        const answerLog = [...qLogs].reverse().find((l: any) => l.event_type === 'ANSWER_UPDATE');
        const timeMs = answerLog?.payload?.telemetry?.timeMs || 0;
        const expectedTime = q.expected_time_seconds || 60;
        const rte = calculateRTE(timeMs, expectedTime);
        const isImpulsive = isRapidGuessing(timeMs, rte);

        console.log(`\n[Q] ${q.stem.substring(0, 30)}...`);
        console.log(`   Selected: ${studentValue} | IsCorrect: ${isCorrect}`);
        console.log(`   TimeMs: ${timeMs}ms | Expected: ${expectedTime}s | RTE: ${rte}`);

        if (isImpulsive) {
            console.log(`   ⚠️ FLAGGED AS IMPULSIVE (Rapid Guessing) -> Evidence Discarded`);
        } else {
            console.log(`   ✅ Evidence Accepted`);
            if (isCorrect) score++;
        }
    });

    console.log(`\n📈 Calculated Score: ${score} / ${questions.length}`);
}

analyzeRootCause();
