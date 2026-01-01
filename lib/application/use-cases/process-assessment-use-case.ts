'use server';

import { createClient } from '../../infrastructure/supabase/supabase-server';
import { DiagnosticResult } from '../../domain/evaluation/types';
import { TriageEngine } from '../../domain/logic/triage-engine';
import { PathMutation } from '../../domain/triage';

interface ProcessAssessmentInput {
    attemptId: string;
    learnerId: string;
    result: DiagnosticResult;
}

/**
 * Use Case: Automatic Remediation Orchestrator.
 * 
 * Takes the "Judgment" (DiagnosticResult) and applies "Sentencing" (Remediation Plan).
 * 1. Calculates mutations via TriageEngine.
 * 2. Executes mutations on the Learner Graph.
 * 3. Logs actions in the Forensic Ledger.
 */
export async function processAssessmentUseCase(input: ProcessAssessmentInput) {
    const supabase = await createClient();

    try {
        // 1. Calculate Remediation Plan (The Strategist)
        const mutations = TriageEngine.calculateRemediationPlan(input.result);

        // 2. Execute Mutations (The Mechanic)
        if (mutations.length > 0) {
            const { getStudentService } = await import('@/lib/infrastructure/di');
            const studentService = getStudentService();

            const success = await studentService.executeMutations(input.learnerId, mutations);

            if (!success) {
                console.error("Partial failure executing mutations for learner", input.learnerId);
            }

            // 3. Log into Forensic Ledger (Intelligence Suite)
            if (input.attemptId) {
                // Fetch current log
                const { data: attempt } = await supabase
                    .from('exam_attempts')
                    .select('applied_mutations')
                    .eq('id', input.attemptId)
                    .single();

                const existingLog = attempt?.applied_mutations && Array.isArray(attempt.applied_mutations)
                    ? attempt.applied_mutations
                    : [];

                const newLogEntries = mutations.map(m => ({
                    timestamp: new Date().toISOString(),
                    action: m.action,
                    target: m.targetNodeId,
                    reason: m.reason,
                    metadata: m.metadata
                }));

                await supabase
                    .from('exam_attempts')
                    .update({
                        applied_mutations: [...existingLog, ...newLogEntries]
                    })
                    .eq('id', input.attemptId);
            }
        }

        return {
            success: true,
            mutationsApplied: mutations.length,
            plan: mutations
        };
    } catch (error: any) {
        console.error('Error processing assessment remediation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
