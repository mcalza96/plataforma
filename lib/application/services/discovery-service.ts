'use server';

import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, generateText } from 'ai';
import { z } from 'zod';
import { PartialKnowledgeMapSchema } from '../../domain/discovery';
import { UsageTrackerService } from '@/lib/services/usage-tracker';

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
