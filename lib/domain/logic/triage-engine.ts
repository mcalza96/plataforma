import { DiagnosticProbe } from '../assessment';
import { AssessmentResult, PathMutation, VerdictType } from '../triage';

/**
 * TriageEngine
 * Pure functional core that decides curricular changes based on diagnostic results.
 */
export class TriageEngine {
    /**
     * Evaluates a result against a probe and returns a list of mutations to apply.
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
