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
                const { continueInterview } = await import('@/lib/application/services/discovery');
                return await continueInterview(coreMessages);

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
