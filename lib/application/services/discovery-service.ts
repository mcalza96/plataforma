'use server';

import Groq from 'groq-sdk';
import { UsageTrackerService } from './usage-tracker';
import { normalizeMessages } from '@/lib/ai/utils';

// Cliente Groq directo (sin AI SDK de Vercel)
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY no está configurada en el servidor.");
    }

    return new Groq({ apiKey });
}

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

// Definición de herramienta en formato Groq nativo
const UPDATE_CONTEXT_TOOL: Groq.Chat.ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'updateContext',
        description: 'Actualiza silenciosamente el contexto extraído del profesor (conceptos, errores, audiencia).',
        parameters: {
            type: 'object',
            properties: {
                subject: {
                    type: 'string',
                    description: 'La materia a enseñar'
                },
                targetAudience: {
                    type: 'string',
                    description: 'Descripción del estudiante objetivo'
                },
                keyConcepts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Conceptos fundamentales identificados'
                },
                identifiedMisconceptions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                            refutation: { type: 'string' }
                        }
                    },
                    description: 'Errores comunes y estrategias de refutación'
                },
                pedagogicalGoal: {
                    type: 'string',
                    description: 'El objetivo pedagógico principal'
                }
            }
        }
    }
};

export async function continueInterview(messages: any[]) {
    const groq = getGroqClient();
    const coreMessages = normalizeMessages(messages);

    console.log("[DiscoveryService] CoreMessages for AI:", JSON.stringify(coreMessages, null, 2));

    try {
        // Llamada directa a Groq sin AI SDK de Vercel
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...coreMessages.map((m: any) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content
                }))
            ],
            tools: [UPDATE_CONTEXT_TOOL],
            tool_choice: 'auto'
        });

        const choice = completion.choices[0];
        const message = choice.message;

        // Procesar tool calls si existen
        let toolResults: any[] = [];
        if (message.tool_calls && message.tool_calls.length > 0) {
            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === 'updateContext') {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log('[DiscoveryService] Context Updated:', JSON.stringify(args, null, 2));
                    toolResults.push({
                        toolCallId: toolCall.id,
                        toolName: toolCall.function.name,
                        args: args,
                        result: { success: true, updatedFields: Object.keys(args) }
                    });
                }
            }
        }

        // Si hubo tool calls pero no hay contenido, hacer follow-up para obtener respuesta de texto
        let assistantContent = message.content || '';
        if (toolResults.length > 0 && !assistantContent) {
            console.log('[DiscoveryService] Making follow-up call for text response...');

            // Construir mensajes con resultados de herramientas
            const followUpMessages: any[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...coreMessages.map((m: any) => ({
                    role: m.role as 'user' | 'assistant' | 'system',
                    content: m.content
                })),
                // El mensaje del asistente que incluye el tool call
                {
                    role: 'assistant' as const,
                    tool_calls: message.tool_calls?.map(tc => ({
                        id: tc.id,
                        type: 'function' as const,
                        function: {
                            name: tc.function.name,
                            arguments: tc.function.arguments
                        }
                    }))
                },
                // El resultado de la herramienta
                ...toolResults.map(tr => ({
                    role: 'tool' as const,
                    tool_call_id: tr.toolCallId,
                    content: JSON.stringify(tr.result)
                }))
            ];

            const followUp = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: followUpMessages,
                tools: [UPDATE_CONTEXT_TOOL],
                tool_choice: 'none' // Forzar respuesta de texto, no más tool calls
            });

            assistantContent = followUp.choices[0]?.message?.content || '';
            console.log('[DiscoveryService] Follow-up response:', assistantContent);
        }

        // Tracking de uso (async, no bloquea)
        if (completion.usage) {
            UsageTrackerService.track({
                userId: 'mock-user-id',
                model: 'llama-3.3-70b-versatile',
                tokensInput: completion.usage.prompt_tokens || 0,
                tokensOutput: completion.usage.completion_tokens || 0,
                featureUsed: 'chat'
            }).catch(e => console.error("[DiscoveryService] Tracking error:", e));
        }

        // Construir respuesta 
        const responseBody = JSON.stringify({
            role: 'assistant',
            content: assistantContent,
            toolCalls: toolResults
        });

        return new Response(responseBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-tool-calls': JSON.stringify(toolResults)
            }
        });

    } catch (error: any) {
        console.error('[DiscoveryService] Groq API Error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Error en la API de Groq'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
