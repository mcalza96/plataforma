import { SupabaseClient } from '@supabase/supabase-js';
import { ArchitectState } from '@/lib/domain/architect';
import { generateProbeFromContext, generatePrototypesFromContext } from '../assessment/assessment-generator';

/**
 * ArchitectService - Business Logic for the Assessment Architect Module
 */
export class ArchitectService {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Persists the architect's findings and generates a diagnostic probe.
     */
    async compileDiagnostic(state: ArchitectState) {
        if (!state.readiness.isValid) {
            throw new Error("El estado del arquitecto no es válido para generación.");
        }

        // 1. Upsert Competency Node
        const { data: competency, error: compError } = await this.supabase
            .from('competency_nodes')
            .upsert({
                title: state.context.subject,
                description: state.context.pedagogicalGoal || `Competencia de ${state.context.subject}`,
                metadata: {
                    audience: state.context.targetAudience,
                    keyConcepts: state.context.keyConcepts
                }
            }, { onConflict: 'title' })
            .select()
            .single();

        if (compError) throw compError;

        // 2. AI Generation
        const probeData = await generateProbeFromContext(state.context);

        // 3. Persist Probe
        const { data: probe, error: probeError } = await this.supabase
            .from('diagnostic_probes')
            .insert({
                competency_id: competency.id,
                type: probeData.type,
                stem: probeData.stem,
                metadata: probeData.metadata
            })
            .select()
            .single();

        if (probeError) throw probeError;

        // 4. Persist Options
        if (probeData.options && probeData.options.length > 0) {
            await this.supabase
                .from('probe_options')
                .insert(
                    probeData.options.map(opt => ({
                        probe_id: probe.id,
                        content: opt.content,
                        is_correct: opt.isCorrect,
                        feedback: opt.feedback,
                        diagnoses_misconception_id: opt.diagnosesMisconceptionId
                    }))
                );
        }

        return {
            probeId: probe.id,
            competencyId: competency.id,
            stem: probe.stem,
            options: probeData.options
        };
    }

    /**
     * Generates multiple draft questions for user review.
     */
    async generatePrototypes(state: ArchitectState) {
        const result = await generatePrototypesFromContext(state.context);
        return result.prototypes;
    }
}
