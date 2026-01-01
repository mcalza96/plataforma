
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { evaluateSession } from '../lib/domain/evaluation/inference-engine';

// Mock values
const ATTEMPT_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';
const MOCK_USER_ID = 'cfc19919-db95-452a-878d-5793f6b2fee6'; // Teacher
const MOCK_LEARNER_ID = 'a111c7c6-df45-4c7b-a3b6-1a77466449ed'; // Leo

// Init Supabase Service Role (Simulating createServiceRoleClient)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const serviceSupabase = createClient(supabaseUrl, supabaseKey);

async function reproduce() {
    console.log("Starting reproduction of finalizeAttempt logic...");

    try {
        // 1. Mark as completed and fetch
        console.log("1. Fetching attempt...");
        const { data: attempt, error: attemptError } = await serviceSupabase
            .from("exam_attempts")
            .select("*")
            .eq("id", ATTEMPT_ID)
            .single();

        if (attemptError || !attempt) {
            throw new Error(`Attempt fetch failed: ${attemptError?.message}`);
        }
        console.log("   Attempt found. Status:", attempt.status);

        const examData = attempt.config_snapshot;
        if (!examData) console.warn("   WARNING: config_snapshot is missing!");

        // 2. Fetch logs
        console.log("2. Fetching logs...");
        const { data: logs, error: logError } = await serviceSupabase
            .from("telemetry_logs")
            .select("*")
            .eq("attempt_id", ATTEMPT_ID)
            .order("timestamp", { ascending: true });

        if (logError) throw new Error(`Log fetch failed: ${logError.message}`);
        console.log(`   Logs found: ${logs.length}`);

        // 3. Prepare Data (The Logic I modified)
        console.log("3. Preparing Evaluation Data...");
        const questions = (examData?.questions || []) as any[];

        // RECONSTRUCTION FALLBACK LOGIC
        const state = { ...(attempt.current_state || {}) };
        const answerLogs = logs?.filter(l => l.event_type === 'ANSWER_UPDATE') || [];

        if (Object.keys(state).length === 0 && answerLogs.length > 0) {
            console.log(`   Triggering Reconstruction from ${answerLogs.length} answer logs...`);
            answerLogs.forEach(l => {
                if (l.payload.questionId && l.payload.value !== undefined) {
                    state[l.payload.questionId] = l.payload.value;
                }
            });
            console.log("   Reconstructed State Keys:", Object.keys(state));
        }

        const responses: any[] = questions.map(q => {
            const studentValue = state[q.id];
            const qLogs = logs?.filter(l => l.payload.questionId === q.id) || [];
            const answerLog = [...qLogs].reverse().find(l => l.event_type === 'ANSWER_UPDATE');

            // This is the line I changed:
            const selectedOption = q.options?.find((o: any) => o.id === studentValue);
            const isCorrect = selectedOption?.isCorrect === true;

            return {
                questionId: q.id,
                selectedOptionId: studentValue || 'none',
                isCorrect: isCorrect,
                confidence: answerLog?.payload?.telemetry?.confidence || 'NONE',
                telemetry: {
                    timeMs: answerLog?.payload?.telemetry?.timeMs || 0,
                    expectedTime: q.expected_time_seconds || 60,
                    hesitationCount: qLogs.filter(l => l.event_type === 'HESITATION').length,
                    hoverTimeMs: 0,
                }
            };
        });

        console.log("   Responses mapped:", responses.length);

        // 4. Build Q-Matrix
        const qMatrix: any[] = questions.map(q => ({
            questionId: q.id,
            competencyId: q.competencyId || 'generic',
            isTrap: false, // Simplifying for test
            trapOptionId: null,
            idDontKnowOptionId: null
        }));

        // 5. Run Evaluation
        console.log("5. Running Evaluation...");
        const targetLearnerId = MOCK_LEARNER_ID;
        const result = evaluateSession(ATTEMPT_ID, targetLearnerId, responses, qMatrix);
        console.log("   Evaluation Result Score:", result.overallScore);

        // 6. Save (Simulated)
        console.log("6. Saving to DB...");
        const { error: updateError } = await serviceSupabase
            .from("exam_attempts")
            .update({ results_cache: result })
            .eq("id", ATTEMPT_ID);

        if (updateError) throw new Error(`Update failed: ${updateError.message}`);
        console.log("SUCCESS: Reproduction completed without crash.");

    } catch (error) {
        console.error("CRASH DETECTED:");
        console.error(error);
    }
}

reproduce();
