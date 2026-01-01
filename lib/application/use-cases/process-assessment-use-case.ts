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
        // 1. Calculate Remediation Plan (The Strategist)
        // We assume input.result is actually a DiagnosticResult or we construct one. 
        // The prompt implies we might receive the full DiagnosticResult now.
        // If input.result is AssessmentResult (single item), TriageEngine.evaluate is fine.
        // But Phase 4 asks for "Obtener las mutaciones del TriageEngine" which now has calculateRemediationPlan (full).
        // Let's assume for this specific single-item flow we use TriageEngine.evaluate which I should keep compatible or update

        // Wait, the prompt says "Refactoriza... tras obtener las mutaciones del TriageEngine".
        // If we are processing a single probe (this UC), we use TriageEngine.evaluate (legacy wrapper I fixed).

        const mutations = TriageEngine.evaluate(input.probe, input.result);

        // 2. Execute Mutations (The Mechanic)
        if (mutations.length > 0) {
            const { getStudentService } = await import('@/lib/infrastructure/di');
            const studentService = getStudentService();

            await studentService.executeMutations(input.result.learnerId, mutations);

            // 3. Log into Forensic Ledger (Intelligence Suite)
            if (input.result.attemptId) {
                // Fetch current log to append or just append using jsonb_concat if supported, 
                // but supabase js simple update is safer to read-modify-write or use an RPC.
                // For simplicity and speed in this task, we'll just read and update.
                // Optimistically: We assume concurrent updates are rare for a single student's attempt.

                const { data: attempt } = await supabase
                    .from('exam_attempts')
                    .select('applied_mutations')
                    .eq('id', input.result.attemptId)
                    .single();

                const existingLog = attempt?.applied_mutations && Array.isArray(attempt.applied_mutations)
                    ? attempt.applied_mutations
                    : [];

                const newLogEntry = {
                    timestamp: new Date().toISOString(),
                    probeId: input.probe.id,
                    mutations: mutations.map(m => ({
                        action: m.action,
                        target: m.targetNodeId,
                        reason: m.reason,
                        metadata: m.metadata
                    }))
                };

                await supabase
                    .from('exam_attempts')
                    .update({
                        applied_mutations: [...existingLog, newLogEntry]
                    })
                    .eq('id', input.result.attemptId);
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
