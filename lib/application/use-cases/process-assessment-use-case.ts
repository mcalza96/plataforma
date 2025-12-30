'use server';

import { createClient } from '../../infrastructure/supabase/supabase-server';
import { DiagnosticProbe } from '../../domain/assessment';
import { AssessmentResult, PathMutation } from '../../domain/triage';
import { TriageEngine } from '../../domain/logic/triage-engine';

interface ProcessAssessmentInput {
    probe: DiagnosticProbe;
    result: AssessmentResult;
}

/**
 * Use Case: Process an assessment result and mutate the learner path.
 */
export async function processAssessmentUseCase(input: ProcessAssessmentInput) {
    const supabase = await createClient();

    try {
        // 1. Execute the Triage Engine (Pure Domain Logic)
        const mutations = TriageEngine.evaluate(input.probe, input.result);

        // 2. Persist Mutations (Infrastructure)
        for (const mutation of mutations) {
            if (mutation.action === 'INSERT_NODE' && mutation.metadata.contentId) {
                // Insert a bridge/refutation node in the path
                await supabase.from('path_nodes').insert({
                    learner_id: input.result.learnerId,
                    content_id: mutation.metadata.contentId,
                    status: mutation.metadata.newStatus || 'locked',
                    title_override: `Refuerzo: ${mutation.reason}`,
                    // Logic to adjust order could be more complex, here we assume it goes before the current
                });
            } else if (mutation.action === 'UNLOCK_NEXT') {
                // Update current node status to mastered
                await supabase.from('path_nodes')
                    .update({ status: 'mastered', is_completed: true })
                    .match({ learner_id: input.result.learnerId, content_id: input.probe.competencyId });

                // Logic to unlock the next node would go here
            }
        }

        return {
            success: true,
            mutations: mutations.map(m => ({
                action: m.action,
                reason: m.reason
            }))
        };
    } catch (error: any) {
        console.error('Error processing assessment triage:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
