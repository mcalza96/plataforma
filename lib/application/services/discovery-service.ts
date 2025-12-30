'use server';

import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, generateText } from 'ai';
import { z } from 'zod';
import { PartialKnowledgeMapSchema } from '../../domain/discovery';
import { UsageTrackerService } from '@/lib/services/usage-tracker';
import { SOCRATIC_PROMPT } from '@/lib/ai/prompts';

// La inicialización se hace perezosa para evitar crashes en build time o si falta la env var al cargar el modulo
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("[DiscoveryService] API Key Status:", !!apiKey);

    if (!apiKey) {
        throw new Error("GROQ_API_KEY no está configurada en el servidor. Verifica tu archivo .env.local");
    }

    return createGroq({
        apiKey,
    });
}

/**
 * Pedagogical Knowledge Engineer System Prompt
 */
const SYSTEM_PROMPT = `
${SOCRATIC_PROMPT}

CONVERSATION PROTOCOL:
1. One question at a time.
2. **Silent Observation (CRITICAL)**: Every time the user mentions a specific concept or a potential student error, you MUST call 'updateContext' with the detected information. 
   - DO NOT announce you are updating the context.
   - DO NOT ask permission to record the data.
   - Simply call the tool and continue the Socratic dialogue in the same turn.
3. When you have identified at least:
   - 3 Key Concepts
   - 1 Misconception
   - Clear Target Audience
   You may mention that the "Knowledge Map" is taking shape, but keep digging for "Atomic Steps".
`;

/**
 * Continues the discovery interview using Vercel AI SDK.
 */
export async function continueInterview(messages: any[]) {
    const groq = getGroqClient();
    const model = groq('llama-3.3-70b-versatile');

    // Normalizar mensajes para cumplir con el esquema CoreMessage[] del AI SDK
    const coreMessages = messages.map(m => {
        // Si ya tiene content string, lo usamos
        if (typeof m.content === 'string' && m.content.length > 0) {
            return { role: m.role, content: m.content };
        }
        // Si tiene parts (formato del cliente), extraemos el texto
        if (Array.isArray(m.parts)) {
            const text = m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('\n');
            return { role: m.role, content: text };
        }
        // Fallback
        return { role: m.role, content: m.content || '' };
    });

    console.log("[DiscoveryService] CoreMessages for AI:", JSON.stringify(coreMessages, null, 2));

    const result = streamText({
        model,
        system: SYSTEM_PROMPT,
        messages: coreMessages,
        toolChoice: 'auto',
        tools: {
            updateContext: tool({
                description: 'Actualiza silenciosamente el contexto extraído del profesor (conceptos, errores, audiencia).',
                parameters: PartialKnowledgeMapSchema,
                execute: async (params: any) => {
                    return { success: true, updatedFields: Object.keys(params) };
                },
            } as any),
        },
        onFinish: async ({ usage }) => {
            try {
                if (!usage) return;
                const u = usage as any;
                UsageTrackerService.track({
                    userId: 'mock-user-id',
                    model: 'llama-3.3-70b-versatile',
                    tokensInput: u.inputTokens || u.promptTokens || 0,
                    tokensOutput: u.outputTokens || u.completionTokens || 0,
                    featureUsed: 'chat'
                }).catch(e => console.error("[DiscoveryService] Async tracking error:", e));
            } catch (trackError) {
                console.error("[DiscoveryService] Failed to initialize usage tracking:", trackError);
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
