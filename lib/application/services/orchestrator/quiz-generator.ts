import type { IAIProvider } from '../../../domain/repositories/ai-provider';
import type { AtomicLearningObject } from '../../../domain/schemas/alo';
import type { QuizQuestion } from './types';
import { buildQuizPrompt } from './prompts';

/**
 * Genera un banco de preguntas basado en contenidos
 */
export async function generateQuiz(
    alos: AtomicLearningObject[],
    aiProvider: IAIProvider
): Promise<QuizQuestion[]> {
    const context = alos.map(a => `${a.title}: ${a.description}`).join("\n");
    const prompt = buildQuizPrompt(context);

    return aiProvider.generateQuiz(context);
}
