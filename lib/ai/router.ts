import { generateObject } from 'ai';
import { RouterIntentSchema, RouterIntent } from './schemas';
import { ROUTER_PROMPT } from './prompts';
import { normalizeMessages } from './utils';
import { AIProvider } from '@/lib/infrastructure/ai/ai-provider';

/**
 * Classifies the user's intent based on their query and history.
 * Uses the Vercel AI SDK `generateObject` for type-safe classification.
 * 
 * @param messages The chat history.
 * @param lessonId Optional current lesson context.
 * @returns An object with the classified intent and reasoning.
 */
export async function classifyIntent(
    messages: any[],
    lessonId?: string
): Promise<{ intent: RouterIntent; reasoning: string }> {
    const coreMessages = normalizeMessages(messages);
    try {
        const { object } = await generateObject({
            model: AIProvider.getModel({ temperature: 0 }),
            system: `${ROUTER_PROMPT} ${lessonId ? `\n\nCONTEXTO ACTUAL: Trabajando en la lección con ID: ${lessonId}` : ''}`,
            messages: coreMessages,
            // @ts-ignore - The SDK version might have minor typing discrepancies in some environments
            schema: RouterIntentSchema,
            // @ts-ignore - Disable strict mode for Groq compatibility
            experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
        });

        const intent = (object as any).intent as RouterIntent;
        const reasoning = (object as any).reasoning as string;

        console.log(`[Router] Intent: ${intent} | Reason: ${reasoning}`);

        return { intent, reasoning };
    } catch (error) {
        console.error('[Router] ❌ Error en clasificación:', error);
        return {
            intent: 'CHAT',
            reasoning: 'Error en clasificación, cayendo a chat básico'
        };
    }
}
