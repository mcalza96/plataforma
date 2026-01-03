import { SupabaseClient } from '@supabase/supabase-js';
import { finalizeAttempt } from '@/lib/actions/assessment/finalization-actions'; // Wait, I'm moving logic FROM actions TO service
import { evaluateSession } from '@/lib/domain/evaluation/inference-engine';

/**
 * AssessmentService - Core Business Logic for Assessment Lifecycle
 */
export class AssessmentService {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Finalizes an assessment attempt, performing evaluation and triggering remediation.
     */
    async finalizeAttempt(attemptId: string, learnerId: string, finalSnapshot: Record<string, any>) {
        // 1. Fetch attempt and telemetry data
        const { data: attempt } = await this.supabase
            .from("exam_attempts")
            .select("*")
            .eq("id", attemptId)
            .single();

        if (!attempt) throw new Error("Attempt not found");

        const { data: logs } = await this.supabase
            .from("telemetry_logs")
            .select("*")
            .eq("attempt_id", attemptId)
            .order("timestamp", { ascending: true });

        const examData = attempt.config_snapshot;
        const questions = (examData.questions || []) as any[];

        // 2. Prepare evaluation data
        const state = { ...attempt.current_state, ...finalSnapshot };

        const responses = questions.map(q => {
            const studentValue = state[q.id];
            const qLogs = logs?.filter(l => l.payload.questionId === q.id) || [];

            // Get the last valid answer update for this question
            const answerLog = [...qLogs].reverse().find(l => l.event_type === 'ANSWER_UPDATE');

            const selectedOption = q.options?.find((o: any) => o.id === studentValue);
            const isCorrect = selectedOption?.isCorrect === true;

            // We count HESITATION events directly from the log for absolute fidelity
            const hesitationCount = qLogs.filter(l => l.event_type === 'HESITATION').length;

            return {
                questionId: q.id,
                selectedOptionId: studentValue || 'none',
                isCorrect: isCorrect,
                confidence: (answerLog?.payload?.telemetry?.confidence || 'NONE') as any,
                telemetry: {
                    timeMs: answerLog?.payload?.telemetry?.timeMs || 0,
                    expectedTime: q.expected_time_seconds || 60,
                    hesitationCount: hesitationCount,
                    focusLostCount: qLogs.filter(l => l.event_type === 'FOCUS_LOST').length,
                    revisitCount: (answerLog?.payload?.telemetry?.revisitCount || 0) as number,
                    hoverTimeMs: 0,
                }
            };
        });

        const qMatrix = questions.map(q => {
            // Shadow Nodes: Find if ANY option selected by student handles a specific misconception
            const studentValue = state[q.id];
            const selectedOption = q.options?.find((o: any) => o.id === studentValue);

            // Logic: A question is a Trap if it has options with diagnosesMisconceptionId
            const trapOption = q.options?.find((o: any) => !!o.diagnosesMisconceptionId);

            return {
                questionId: q.id,
                competencyId: q.competencyId || 'generic',
                isTrap: !!trapOption,
                trapOptionId: trapOption?.id,
                misconceptionId: selectedOption?.diagnosesMisconceptionId || undefined,
                idDontKnowOptionId: q.options?.find((o: any) => o.isGap === true)?.id
            };
        });

        // 3. Execute Evaluation
        const result = evaluateSession(attemptId, learnerId, responses, qMatrix);

        // 4. Persist Results & Status
        await this.supabase
            .from("exam_attempts")
            .update({
                status: "COMPLETED",
                finished_at: new Date().toISOString(),
                current_state: state,
                results_cache: result
            })
            .eq("id", attemptId);

        // 5. Trigger Remediation Loop (Async)
        // We import it dynamically to avoid circular dependencies if any
        try {
            const { processAssessmentUseCase } = await import("@/lib/application/use-cases/process-assessment-use-case");
            await processAssessmentUseCase({
                attemptId,
                learnerId,
                result
            });
        } catch (err) {
            console.error("[AssessmentService] Remediation failed:", err);
        }

        return result;
    }
}
