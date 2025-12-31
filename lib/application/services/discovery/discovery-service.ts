'use server';

import { normalizeMessages } from '@/lib/ai/utils';
import { UsageTrackerService } from '../usage-tracker';
import { getGroqClient } from './groq-client';
import { MODEL_NAME, UPDATE_CONTEXT_TOOL } from './constants';
import { buildInitialMessages, buildFollowUpMessages } from './message-builder';
import { processToolCalls, shouldMakeFollowUp } from './tool-processor';
import type { DiscoveryResponse } from './types';

/**
 * Continúa la entrevista con el Arquitecto Curricular
 * Orquesta las llamadas a Groq, procesamiento de tool calls, y follow-ups
 */
export async function continueInterview(messages: any[]): Promise<Response> {
    const groq = getGroqClient();
    const coreMessages = normalizeMessages(messages);

    console.log("[DiscoveryService] CoreMessages for AI:", JSON.stringify(coreMessages, null, 2));

    try {
        // 1. Llamada inicial a Groq
        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: buildInitialMessages(coreMessages),
            tools: [UPDATE_CONTEXT_TOOL],
            tool_choice: 'auto'
        });

        const choice = completion.choices[0];
        const message = choice.message;

        // 2. Procesar tool calls si existen
        const toolResults = message.tool_calls && message.tool_calls.length > 0
            ? processToolCalls(message.tool_calls)
            : [];

        // 3. Determinar si necesitamos follow-up para obtener respuesta de texto
        let assistantContent = message.content || '';

        if (shouldMakeFollowUp(toolResults, message.content)) {
            console.log('[DiscoveryService] Making follow-up call for text response...');

            const followUp = await groq.chat.completions.create({
                model: MODEL_NAME,
                messages: buildFollowUpMessages(coreMessages, message.tool_calls!, toolResults),
                tools: [UPDATE_CONTEXT_TOOL],
                tool_choice: 'none' // Forzar respuesta de texto
            });

            assistantContent = followUp.choices[0]?.message?.content || '';
            console.log('[DiscoveryService] Follow-up response:', assistantContent);
        }

        // 4. Tracking de uso (async, no bloquea)
        if (completion.usage) {
            UsageTrackerService.track({
                userId: 'mock-user-id', // TODO: Integrar con Auth
                model: MODEL_NAME,
                tokensInput: completion.usage.prompt_tokens || 0,
                tokensOutput: completion.usage.completion_tokens || 0,
                featureUsed: 'chat'
            }).catch(e => console.error("[DiscoveryService] Tracking error:", e));
        }

        // 5. Construir y retornar respuesta
        const responseData: DiscoveryResponse = {
            role: 'assistant',
            content: assistantContent,
            toolCalls: toolResults
        };

        return new Response(JSON.stringify(responseData), {
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
