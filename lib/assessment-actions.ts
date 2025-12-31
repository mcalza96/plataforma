'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { DiagnosticProbe, ProbeOption } from './domain/assessment';
import { AssessmentResult } from './domain/triage';
import { processAssessmentUseCase } from './application/use-cases/process-assessment-use-case';
import { cookies } from 'next/headers';

/**
 * getAssessment
 * Retrieves a diagnostic probe and its options from the database.
 */
export async function getAssessment(id: string) {
    const supabase = await createClient();

    const { data: probe, error: probeError } = await supabase
        .from('diagnostic_probes')
        .select(`
            *,
            options:probe_options(*)
        `)
        .eq('id', id)
        .single();

    if (probeError || !probe) {
        console.error("[AssessmentActions] Error fetching probe:", probeError);
        return null;
    }

    // Map to Domain Entity
    return new DiagnosticProbe(
        probe.id,
        probe.competency_id,
        probe.type,
        probe.stem,
        probe.options.map((o: any) => new ProbeOption(
            o.content,
            o.is_correct,
            o.feedback,
            o.diagnoses_misconception_id,
            o.id
        )),
        probe.metadata,
        new Date(probe.created_at)
    );
}

/**
 * submitAssessment
 * Processes a student's answer and triggers the triage engine.
 */
export async function submitAssessment(probeId: string, selectedOptionId: string) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        throw new Error("No se encontró una sesión de estudiante activa.");
    }

    // 1. Re-fetch probe to ensure data integrity for triage
    const probe = await getAssessment(probeId);
    if (!probe) throw new Error("Pregunta no encontrada.");

    // 2. Build Assessment Result
    const result = new AssessmentResult(
        crypto.randomUUID(),
        probeId,
        learnerId,
        selectedOptionId,
        0 // timeSpentSeconds (could be tracked in future)
    );

    // 3. Process Triage
    const triageResult = await processAssessmentUseCase({ probe, result });

    if (!triageResult.success) {
        throw new Error(triageResult.error || "Error al procesar el triaje.");
    }

    // 4. Determine primary feedback based on mutations
    const mutations = triageResult.mutations || [];
    const selectedOption = probe.options.find(o => o.id === selectedOptionId);

    return {
        success: true,
        mutations: mutations,
        feedback: selectedOption?.feedback || (selectedOption?.isCorrect ? "¡Excelente trabajo! Has demostrado dominio." : "Esta no es la respuesta correcta, pero es una oportunidad para aprender."),
        isMastery: mutations.some(m => m.action === 'UNLOCK_NEXT'),
        isMisconception: mutations.some(m => m.action === 'INSERT_NODE' && m.reason.includes('conceptual'))
    };
}
