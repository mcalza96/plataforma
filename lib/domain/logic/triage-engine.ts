import { DiagnosticProbe } from '../assessment';
import { AssessmentResult, PathMutation, VerdictType } from '../triage';
import { DiagnosticResult } from '../evaluation/types';

/**
 * TriageEngine
 * Pure functional core that decides curricular changes based on diagnostic results.
 */
export class TriageEngine {
    /**
     * Calculates a comprehensive remediation plan based on the "Judge's" Diagnostic Result.
     */
    public static calculateRemediationPlan(diagnosis: DiagnosticResult): PathMutation[] {
        const mutations: PathMutation[] = [];

        // Iterate over key diagnoses
        for (const d of diagnosis.competencyDiagnoses) {

            // 1. Shadow Detection (Specific Bug) -> Fog of War + Refutation INJECTION
            if (d.state === 'MISCONCEPTION' && d.evidence.misconceptionId) {
                mutations.push(new PathMutation(
                    'INSERT_NODE',
                    d.competencyId,
                    `Detectado Bug Crítico: ${d.evidence.reason}`,
                    {
                        position: 'BEFORE',
                        newStatus: 'infected', // Visual cue for "Virus"
                        contentId: d.evidence.misconceptionId, // Points to Refutation Content (ALO)
                        title: `Protocolo de Desinfección: ${d.competencyId}`
                    }
                ));

                // Fog of War: Lock everything downstream to prevent pollution
                mutations.push(new PathMutation(
                    'LOCK_DOWNSTREAM',
                    d.competencyId,
                    'Cuarentena Cognitiva activada.',
                    {
                        newStatus: 'locked'
                    }
                ));
            }

            // 2. Knowledge Gap (Missing Link) -> Scaffolding INJECTION
            else if (d.state === 'GAP') {
                mutations.push(new PathMutation(
                    'INSERT_NODE',
                    d.competencyId,
                    `Brecha detectada: ${d.evidence.reason}`,
                    {
                        position: 'BEFORE',
                        newStatus: 'available',
                        // In a real system, we'd look up the "Prerequisite" or "Remedial" content ID here
                        // For now we assume a convention or passed metadata
                        contentId: `remedial-${d.competencyId}`,
                        title: `Refuerzo: ${d.competencyId}`
                    }
                ));
            }

            // 3. Mastery -> Unlock Next
            else if (d.state === 'MASTERED') {
                mutations.push(new PathMutation(
                    'UNLOCK_NEXT',
                    d.competencyId,
                    'Competencia dominada.',
                    {
                        newStatus: 'mastered'
                    }
                ));
            }
        }

        return mutations;
    }

    /**
     * Evaluates a result against a probe and returns a list of mutations to apply.
     * @deprecated Use calculateRemediationPlan with full DiagnosticResult instead.
     */
    public static evaluate(probe: DiagnosticProbe, result: AssessmentResult): PathMutation[] {
        const selectedOption = probe.options.find(o => o.id === result.selectedOptionId);

        if (!selectedOption) {
            throw new Error(`Opción seleccionada ${result.selectedOptionId} no encontrada en el probe ${probe.id}`);
        }

        const mutations: PathMutation[] = [];

        // 1. Check for Specific Misconception (Shadow Detection)
        if (selectedOption.diagnosesMisconceptionId) {
            mutations.push(new PathMutation(
                'INSERT_NODE',
                probe.competencyId,
                `Detectado error conceptual específico: ${selectedOption.feedback || 'Lógica de distractor crítico'}`,
                {
                    position: 'BEFORE',
                    newStatus: 'infected',
                    contentId: selectedOption.diagnosesMisconceptionId // In theory, we point to the refutation content for this ID
                }
            ));

            // Fog of War: Lock everything downstream to prevent pollution
            mutations.push(new PathMutation(
                'LOCK_DOWNSTREAM',
                probe.competencyId,
                'Cuarentena Cognitiva activada.',
                {
                    newStatus: 'locked'
                }
            ));
            return mutations;
        }

        // 2. Check for Knowledge Gap (Generic Error)
        if (!selectedOption.isCorrect) {
            mutations.push(new PathMutation(
                'INSERT_NODE',
                probe.competencyId,
                `Brecha de conocimiento detectada: ${selectedOption.feedback || 'Respuesta incorrecta'}`,
                {
                    position: 'BEFORE',
                    newStatus: 'locked',
                    // Here we would point to scaffolding content
                }
            ));
            return mutations;
        }

        // 3. Check for Mastery
        if (selectedOption.isCorrect) {
            mutations.push(new PathMutation(
                'UNLOCK_NEXT',
                probe.competencyId,
                'Dominio de competencia confirmado.',
                {
                    newStatus: 'mastered'
                }
            ));
        }

        return mutations;
    }
}
