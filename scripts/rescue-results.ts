
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { evaluateSession } from '../lib/domain/evaluation/inference-engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function rescue() {
    console.log("Pedagogical Rescue Mission: Starting...");

    // 1. Find all completed attempts without cache
    const { data: attempts, error: fetchError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('status', 'COMPLETED')
        .is('results_cache', null);

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return;
    }

    console.log(`Found ${attempts?.length || 0} attempts requiring rescue.`);

    for (const attempt of (attempts || [])) {
        console.log(`Processing Attempt: ${attempt.id}`);

        // 2. Fetch telemetry logs for this attempt
        const { data: logs } = await supabase
            .from('telemetry_logs')
            .select('*')
            .eq('attempt_id', attempt.id)
            .order('timestamp', { ascending: true });

        // 3. Map to StudentResponse[]
        let examData = attempt.config_snapshot;

        if (!examData || Object.keys(examData).length === 0) {
            const { data: exam } = await supabase
                .from('exams')
                .select('config_json')
                .eq('id', attempt.exam_config_id)
                .single();
            examData = exam?.config_json;
        }

        if (!examData) {
            console.log(` - Skip: No configuration found for attempt ${attempt.id}`);
            continue;
        }

        const questions = (examData.questions || []) as any[];
        const responses: any[] = questions.map(q => {
            const studentValue = attempt.current_state[q.id];
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
                    hoverTimeMs: 0
                }
            };
        });

        // 4. Build Q-Matrix
        const qMatrix: any[] = questions.map(q => {
            const misconception = examData.matrix?.misconceptions?.find((m: any) =>
                m.description.includes(q.stem) || q.options?.some((o: any) => o.id === m.trapOptionId)
            );
            return {
                questionId: q.id,
                competencyId: q.competencyId || 'generic',
                isTrap: !!misconception,
                trapOptionId: misconception?.trapOptionId || q.options?.find((o: any) => !o.isCorrect && !o.isGap)?.id,
                idDontKnowOptionId: q.options?.find((o: any) => o.isGap === true)?.id
            };
        });

        // 5. Run Evaluation
        const result = evaluateSession(attempt.id, attempt.learner_id, responses, qMatrix);

        // 6. Persist
        const { error: updateError } = await supabase
            .from('exam_attempts')
            .update({ results_cache: result })
            .eq('id', attempt.id);

        if (updateError) {
            console.error(` - Error updating ${attempt.id}:`, updateError.message);
        } else {
            console.log(` - Success: Attempt ${attempt.id} calibrated.`);
        }
    }

    console.log("Rescue Mission: Concluded.");
}

rescue();
