import type { IAIProvider } from '../../../domain/repositories/ai-provider';
import type { Diagnosis, PlanningProposal } from './types';
import type { AtomicLearningObject } from '../../../domain/schemas/alo';
import { buildPlanningPrompt } from './prompts';

/**
 * Secuencia contenido basado en diagnóstico del alumno
 */
export async function sequenceContent(
    diagnosis: Diagnosis,
    alos: AtomicLearningObject[],
    aiProvider: IAIProvider
): Promise<PlanningProposal> {
    const alosMetadata = alos.map(a => ({
        id: a.id,
        title: a.title,
        type: a.type,
        level: a.metadata.bloom_level,
        skills: a.metadata.skills
    }));

    const prompt = buildPlanningPrompt(diagnosis, alosMetadata);
    const proposal = await aiProvider.generatePlanning(prompt);

    return proposal;
}
