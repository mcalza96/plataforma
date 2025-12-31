import { IContentRepository } from "../../../domain/repositories/content-repository";
import { IAIProvider } from "../../../domain/repositories/ai-provider";
import type { Diagnosis, PlanningProposal, QuizQuestion } from './types';
import type { AtomicLearningObject } from '../../../domain/schemas/alo';
import { sequenceContent } from './path-planner';
import { auditProposal } from './content-auditor';
import { generateQuiz } from './quiz-generator';

/**
 * Servicio orquestador de IA para planificación de aprendizaje
 */
export class AIOrchestratorService {
    constructor(
        private aiProvider: IAIProvider,
        private contentRepository: IContentRepository
    ) { }

    /**
     * Genera un plan de aprendizaje personalizado basado en el diagnóstico
     */
    async generatePath(diagnosis: Diagnosis): Promise<PlanningProposal> {
        // 1. Fase de Recuperación (Retrieval)
        const queryText = `${diagnosis.subject}: ${diagnosis.identified_gaps.join(", ")}`;
        const queryVector = await this.aiProvider.embedQuery(queryText);
        const relevantALOs = await this.contentRepository.findRelevantItems(queryVector, 10);

        if (relevantALOs.length === 0) {
            throw new Error("No se encontraron contenidos relevantes en la biblioteca para estas brechas.");
        }

        // 2. Fase de Arquitectura (Sequencing)
        const proposal = await sequenceContent(diagnosis, relevantALOs, this.aiProvider);

        // 3. Fase de Auditoría (Validation)
        auditProposal(proposal, relevantALOs);

        return proposal;
    }

    /**
     * Genera un banco de preguntas basado en contenidos seleccionados
     */
    async generateQuiz(alos: AtomicLearningObject[]): Promise<QuizQuestion[]> {
        return generateQuiz(alos, this.aiProvider);
    }
}
