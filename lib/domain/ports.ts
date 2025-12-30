import { PlanningProposal } from '../services/ai-orchestrator-service';

/**
 * Port for AI Capabilities.
 * Domain depends on this interface instead of concrete LLM libraries.
 */
export interface IAIProvider {
    /**
     * Sequence content based on a pedagogical prompt.
     */
    generatePlanning(prompt: string): Promise<PlanningProposal>;

    /**
     * Generate quiz questions based on content.
     */
    generateQuiz(context: string): Promise<any[]>;

    /**
     * Generate an embedding for a query string.
     */
    embedQuery(text: string): Promise<number[]>;
}
