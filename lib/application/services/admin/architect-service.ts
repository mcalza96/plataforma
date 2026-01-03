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

        // 1. AI Generation
        const probeData = await generateProbeFromContext(state.context);

        // 2. Regla Mandatoria: Al menos un distractor racional vinculado a un misconception
        const hasShadowNode = probeData.options.some((opt: any) => opt.diagnosesMisconceptionId);
        if (!hasShadowNode) {
            throw new Error("Calidad Insuficiente: La sonda no detectó ningún Nodo Sombra. Se requiere al menos un distractor racional.");
        }

        // 3. Upsert Competency Node (Health Matrix logic)
        const { data: competency, error: compError } = await this.supabase
            .from('competency_nodes')
            .upsert({
                title: state.context.subject,
                description: state.context.pedagogicalGoal || `Competencia de ${state.context.subject}`,
                node_type: 'competency',
                metadata: {
                    audience: state.context.targetAudience,
                    keyConcepts: state.context.keyConcepts,
                    healthScore: 100, // Initial health
                    shadowNodesCount: state.context.identifiedMisconceptions?.length || 0
                }
            }, { onConflict: 'title' })
            .select()
            .single();

        if (compError) throw compError;

        // 4. Persist Probe with Psychometric Data
        const { data: probe, error: probeError } = await this.supabase
            .from('diagnostic_probes')
            .insert({
                competency_id: competency.id,
                type: probeData.type,
                stem: probeData.stem,
                metadata: {
                    ...probeData.metadata,
                    expected_time_seconds: probeData.expected_time_seconds,
                    min_viable_time: probeData.min_viable_time
                }
            })
            .select()
            .single();

        if (probeError) throw probeError;

        // 4. Persist Options
        if (probeData.options && probeData.options.length > 0) {
            await this.supabase
                .from('probe_options')
                .insert(
                    probeData.options.map((opt: any) => ({
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
