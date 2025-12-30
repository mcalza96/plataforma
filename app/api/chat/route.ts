import { streamText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { classifyIntent } from '@/lib/ai/router';
import { SOCRATIC_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';
import { PartialKnowledgeMapSchema } from '@/lib/domain/discovery';
import { normalizeMessages } from '@/lib/ai/utils';


const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

const model = groq('llama-3.3-70b-versatile');

export async function POST(req: Request) {
    // 1. Rate Limit Check
    const identifier = "mock-user-id"; // TODO: Integrate with Auth
    const { success } = await checkRateLimit(identifier, 'chat');

    if (!success) {
        return new Response("Has alcanzado tu límite de velocidad cognitiva por hoy.", { status: 429 });
    }

    try {
        const { messages, lessonId } = await req.json();
        const coreMessages = normalizeMessages(messages);

        // 2. Classify Intent
        const { intent, reasoning } = await classifyIntent(coreMessages, lessonId);
        console.log(`[Chat API] 🤖 Intent: ${intent} | Reason: ${reasoning}`);


        // 3. Orchestration
        switch (intent) {
            case 'CANVAS_ACTION':
                // Placeholder for Architect Agent
                return new Response(
                    JSON.stringify({
                        message: "He detectado que quieres realizar una acción en el lienzo. Estamos preparando al Agente Arquitecto para procesar esta solicitud (Fase 4).",
                        intent,
                        reasoning
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-ai-intent': intent,
                            'x-ai-reasoning': reasoning
                        }
                    }
                );

            case 'PEDAGOGICAL_QUERY':
                const pedagogicalSystemPrompt = `
Eres un "Ingeniero de Conocimiento Pedagógico experto en Modelado Cognitivo". 
Tu misión es desglosar el conocimiento en "Pasos Atómicos", identificar "Misconceptions" y optimizar la estructura del aprendizaje basándote exclusivamente en el dominio técnico que el usuario proporcione.
Manten un tono profesional, analítico y directo.

CRITICAL: You must ALWAYS provide a helpful text response to the user. Even if you call the 'updateContext' tool, do not send ONLY the tool call. Your response MUST include text for the teacher.

${SOCRATIC_PROMPT}
`;
                const pedagogicalResult = streamText({
                    model,
                    system: pedagogicalSystemPrompt,
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
                });
                return pedagogicalResult.toUIMessageStreamResponse({
                    headers: {
                        'x-ai-intent': intent,
                        'x-ai-reasoning': reasoning
                    }
                });

            case 'CHAT':
            default:
                const chatResult = streamText({
                    model,
                    system: SOCRATIC_PROMPT,
                    messages: coreMessages,
                });
                return chatResult.toUIMessageStreamResponse({
                    headers: {
                        'x-ai-intent': intent,
                        'x-ai-reasoning': reasoning
                    }
                });
        }

    } catch (error: any) {
        console.error("[Chat API] ❌ Error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Error interno del servidor",
            status: "error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
