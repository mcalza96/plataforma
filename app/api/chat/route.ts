import { streamText, tool } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { classifyIntent } from '@/lib/ai/router';
import { SOCRATIC_PROMPT, buildArchitectPrompt } from '@/lib/ai/prompts';
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
        const { messages, lessonId, stage = 'initial_profiling', context, selectedBlockId } = await req.json();
        const coreMessages = normalizeMessages(messages);

        // 2. Classify Intent
        const { intent, reasoning } = await classifyIntent(coreMessages, lessonId);
        console.log(`[Chat API] 🤖 Intent: ${intent} | Reason: ${reasoning} | Stage: ${stage}`);


        // 3. Route to appropriate handler
        switch (intent) {
            case 'CANVAS_ACTION':
                return new Response(
                    JSON.stringify({
                        error: 'Canvas actions not yet implemented. Use the UI directly for now.'
                    }),
                    {
                        status: 501,
                        headers: {
                            'Content-Type': 'application/json',
                            'x-ai-intent': intent,
                            'x-ai-reasoning': reasoning
                        }
                    }
                );


            case 'PEDAGOGICAL_QUERY':
                // Use FSM-based dynamic prompt for Curriculum Architect
                const { continueInterview } = await import('@/lib/application/services/discovery');
                const { loadDraftExam } = await import('@/lib/actions/assessment/discovery-actions');

                // Fetch current context from database (Única Fuente de Verdad)
                // This ensures we always have the latest Blueprint state, even if the client is out of sync
                const examId = 'draft-exam'; // TODO: Get from user session
                const { success: dbSuccess, context: dbContext } = await loadDraftExam(examId);

                const currentContext = dbSuccess && dbContext ? dbContext : (context || {});

                console.log(`[Chat API] Using dynamic prompt for stage: ${stage} | Selected Block: ${selectedBlockId}`);
                console.log(`[Chat API] Context source: ${dbSuccess ? 'DATABASE (fresh)' : 'CLIENT (fallback)'}`);
                console.log(`[Chat API] Current context:`, currentContext);

                return await continueInterview(coreMessages, stage, currentContext, selectedBlockId);


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
