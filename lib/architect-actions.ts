'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { type ArchitectState } from './domain/architect';
import { generateProbeFromContext } from './application/services/assessment';
import { revalidatePath } from 'next/cache';

/**
 * compileDiagnosticProbe
 * Server Action to persist the architect's findings and generate a diagnostic question.
 */
export async function compileDiagnosticProbe(state: ArchitectState) {
    console.log("[ArchitectAction] Compiling diagnostic...");

    if (!state.readiness.isValid) {
        throw new Error("El estado del arquitecto no es válido para generación.");
    }

    const supabase = await createClient();

    try {
        // 1. Create/Upsert Competency Node (The "Subject")
        const { data: competency, error: compError } = await supabase
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
        console.log("[ArchitectAction] Competency created/found:", competency.id);

        // 2. AI Generation of the Probe
        const probeData = await generateProbeFromContext(state.context);

        // 3. Persist Diagnostic Probe
        const { data: probe, error: probeError } = await supabase
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
        console.log("[ArchitectAction] Probe inserted:", probe.id);

        // 4. Persist Options
        if (probeData.options && probeData.options.length > 0) {
            const { error: optionsError } = await supabase
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

            if (optionsError) throw optionsError;
        }

        revalidatePath('/admin/architect');

        return {
            success: true,
            probeId: probe.id,
            competencyId: competency.id
        };

    } catch (error: any) {
        console.error("[ArchitectAction] Compilation failed:", error);
        return {
            success: false,
            error: error.message || "Error desconocido al compilar el diagnóstico"
        };
    }
}
