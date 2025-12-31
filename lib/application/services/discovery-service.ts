'use server';

import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, generateText } from 'ai';
import { z } from 'zod';
import { PartialKnowledgeMapSchema } from '../../domain/discovery';
import { UsageTrackerService } from './usage-tracker';
import { SOCRATIC_PROMPT } from '../../ai/prompts';


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
 * Implements "Clean Language Interviewing" and the TeacherOS "Shadow Work" protocol.
 */
const SYSTEM_PROMPT = `
Eres el Arquitecto Curricular de TeacherOS, un Ingeniero de Conocimiento experto en "Shadow Work" pedagógico.
Tu misión es EXTRAER el modelo mental del usuario para construir un Blueprint de diagnóstico.

REGLAS ESTRUCTURALES:
1.  **Fases del Diálogo**:
    - PERFIL: Define 'subject' (materia) y 'targetAudience' (ej: "Niños de 8 años").
    - TOPOLOGÍA: Identifica 'keyConcepts' (conceptos nucleares). No aceptes vaguedades.
    - SOMBRA (CRÍTICO): Por cada concepto, extrae 'identifiedMisconceptions' (error y refutación).

2.  **Uso de la Herramienta 'updateContext' (ESTRICTO)**:
    - Debes llamar a 'updateContext' para persistir datos tan pronto como los detectes.
    - **SCHEMA BINDING**: Solo puedes usar estas llaves exactas:
        * 'subject': string (la materia)
        * 'targetAudience': string (quién aprende)
        * 'keyConcepts': string[] (lista de conceptos)
        * 'identifiedMisconceptions': {error: string, refutation: string}[]
        * 'pedagogicalGoal': string (propósito educativo)
    - **PROHIBICIÓN**: No inventes llaves como 'new_key_concept' o 'study_subject'.
    - **PROHIBICIÓN**: NUNCA menciones el nombre de la herramienta ni sus parámetros en tu respuesta de texto.
    - **PROHIBICIÓN**: NUNCA digas "actualizando contexto". Sé silencioso.

3.  **Calidad Pedagógica**: Un malentendido ('misconception') debe ser una idea errónea específica, no una falta de conocimiento.

4.  **RESTRICCIÓN**: Haz una sola pregunta a la vez. Sé breve e incisivo.
`;

/**
 * Continues the discovery interview using Vercel AI SDK.
 */
export async function continueInterview(messages: any[]) {
    const groq = getGroqClient();
    const model = groq('llama-3.3-70b-versatile');

    // Normalizar mensajes para cumplir con el esquema CoreMessage[] del AI SDK
    const { normalizeMessages } = await import('@/lib/ai/utils');
    const coreMessages = normalizeMessages(messages);

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
