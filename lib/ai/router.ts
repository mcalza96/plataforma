import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { RouterIntentSchema, RouterIntent } from './schemas';
import { ROUTER_PROMPT } from './prompts';
import { normalizeMessages } from './utils';


/**
 * Lazily initializes the model to ensure environment variables are loaded.
 */
function getModel() {
    const groqApiKey = process.env.GROQ_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (groqApiKey) {
        const groq = createGroq({ apiKey: groqApiKey });
        return groq('llama-3.3-70b-versatile');
    }

    if (openaiApiKey) {
        const openai = createOpenAI({ apiKey: openaiApiKey });
        return openai('gpt-4o');
    }

    throw new Error('No AI provider API keys found (GROQ_API_KEY or OPENAI_API_KEY)');
}

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
        const { text } = await generateText({
            model: getModel(),
            system: `${ROUTER_PROMPT}
            
            IMPORTANT: You must respond ONLY with a valid JSON object matching this schema:
            {
              "intent": "CHAT" | "CANVAS_ACTION" | "PEDAGOGICAL_QUERY",
              "reasoning": "string"
            }
            
            ${lessonId ? `\n\nCONTEXTO ACTUAL: Trabajando en la lección con ID: ${lessonId}` : ''}`,
            messages: coreMessages,
            temperature: 0,
        });

        // Clean the response from potential markdown code blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const object = JSON.parse(cleanedText) as { intent: RouterIntent; reasoning: string };

        // Basic validation in case the model goes rogue
        if (!['CHAT', 'CANVAS_ACTION', 'PEDAGOGICAL_QUERY'].includes(object.intent)) {
            object.intent = 'CHAT';
        }

        console.log(`[Router] Intent: ${object.intent} | Reason: ${object.reasoning}`);

        return object;
    } catch (error) {
        console.error('[Router] ❌ Error en clasificación:', error);
        return {
            intent: 'CHAT',
            reasoning: 'Error en clasificación, cayendo a chat básico'
        };
    }
}
