import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

/**
 * AIProvider - Centralized Infrastructure for AI Model Management
 */
export class AIProvider {
    private static groqModel = 'llama-3.3-70b-versatile';
    private static fallbackGroqModel = 'llama-3.1-8b-instant';
    private static openaiModel = 'gpt-4o';

    /**
     * Returns a configured LanguageModel instance based on available credentials.
     * Prioritizes Groq for cost-effective high-performance, falls back to OpenAI.
     */
    static getModel(options: { useFallback?: boolean; temperature?: number } = {}): LanguageModel {
        const groqApiKey = process.env.GROQ_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (groqApiKey) {
            const groq = createGroq({ apiKey: groqApiKey });
            return groq(options.useFallback ? this.fallbackGroqModel : this.groqModel);
        }

        if (openaiApiKey) {
            const openai = createOpenAI({ apiKey: openaiApiKey });
            return openai(this.openaiModel);
        }

        throw new Error('No AI provider API keys found (GROQ_API_KEY or OPENAI_API_KEY)');
    }

    /**
     * Standard provider metadata for Groq compatibility when using structured outputs.
     */
    static getGroqStructuredMetadata() {
        return {
            groq: { structuredOutputs: false }
        };
    }
}
