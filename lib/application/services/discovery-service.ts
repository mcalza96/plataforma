'use server';

import { createGroq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { PartialKnowledgeMapSchema } from '../../domain/discovery';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Pedagogical Knowledge Engineer System Prompt
 */
const SYSTEM_PROMPT = `
Eres un "Ingeniero de Conocimiento Pedagógico" experto en TeacherOS. 
Tu objetivo es entrevistar a un profesor para extraer su conocimiento experto y convertirlo en un mapa de competencias estructurado.

REGLAS CRÍTICAS:
1. Haz UNA sola pregunta a la vez. No abraces al profesor con múltiples interrogantes.
2. Usa técnicas de "Clean Language":
   - "¿Qué pasa justo antes de que el alumno cometa ese error?"
   - "¿Hay algo más sobre [ConceptoX]?"
   - "¿Y ese [Concepto] de dónde viene?"
3. Si detectas un concepto clave, un error común (misconception) o el público objetivo, llama a la herramienta 'updateContext' para guardarlo. No necesitas anunciar que estás guardando los datos, hazlo silenciosamente mientras fluyes en la conversación.
4. Tu tono es Socrático, curioso y profesional.
5. Cuando sientas que tienes suficiente información (Sujeto, Audiencia, al menos 3 conceptos clave y 1 error común), puedes sugerir que el mapa está listo, pero permite que el profesor continúe si lo desea.
`;

/**
 * Continues the discovery interview using Vercel AI SDK.
 */
export async function continueInterview(messages: any[]) {
    const model = groq('llama-3.3-70b-versatile');

    const result = streamText({
        model,
        system: SYSTEM_PROMPT,
        messages,
        tools: {
            updateContext: tool({
                description: 'Actualiza silenciosamente el contexto extraído del profesor (conceptos, errores, audiencia).',
                parameters: PartialKnowledgeMapSchema,
                execute: async (params: any) => {
                    return { success: true, updatedFields: Object.keys(params) };
                },
            }) as any,
        },
        onFinish: async ({ usage }) => {
            if (!usage) return;
            import('@/lib/services/usage-tracker').then(({ UsageTrackerService }) => {
                const u = usage as any;
                UsageTrackerService.track({
                    userId: 'mock-user-id',
                    model: 'llama-3.3-70b-versatile',
                    tokensInput: u.promptTokens || u.inputTokens || 0,
                    tokensOutput: u.completionTokens || u.outputTokens || 0,
                    featureUsed: 'chat'
                });
            });
        },
    });

    return result.toTextStreamResponse();
}
