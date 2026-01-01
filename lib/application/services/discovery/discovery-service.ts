'use server';

import { normalizeMessages } from '@/lib/ai/utils';
import { UsageTrackerService } from '../usage-tracker';
import { getGroqClient } from './groq-client';
import { MODEL_NAME, FALLBACK_MODEL_NAME, UPDATE_CONTEXT_TOOL } from './constants';
import { buildInitialMessages, buildFollowUpMessages } from './message-builder';
import { processToolCalls, shouldMakeFollowUp } from './tool-processor';
import type { DiscoveryResponse } from './types';

/**
 * Continúa la entrevista con el Arquitecto Curricular
 * Orquesta las llamadas a Groq, procesamiento de tool calls, y follow-ups
 * 
 * @param messages - Historial de mensajes de la conversación
 * @param stage - Fase actual del FSM
 * @param currentContext - Estado actual del Blueprint (Memoria de Trabajo)
 */
export async function continueInterview(
    messages: any[],
    stage: string = 'initial_profiling',
    currentContext?: any,
    selectedBlockId?: string | null
): Promise<Response> {
    const groq = getGroqClient();

    // Importar acciones de servidor para persistencia
    const { saveDiscoveryContext } = await import('@/lib/actions/discovery-actions');

    // Importar utilidades de compresión
    const { compressConversationHistory } = await import('./compression-utils');

    // Normalizar y comprimir mensajes
    let coreMessages = normalizeMessages(messages);

    // Comprimir historial si es muy largo (ahorro: 40-60% en conversaciones largas)
    if (coreMessages.length > 8) {
        console.log(`[DiscoveryService] Compressing ${coreMessages.length} messages...`);
        coreMessages = compressConversationHistory(coreMessages);
        console.log(`[DiscoveryService] Compressed to ${coreMessages.length} messages`);
    }

    console.log("[DiscoveryService] CoreMessages for AI:", JSON.stringify(coreMessages, null, 2));
    console.log("[DiscoveryService] Current Context:", JSON.stringify(currentContext, null, 2));

    try {
        let completion;
        try {
            console.log(`[DiscoveryService] Attempting call with primary model: ${MODEL_NAME}`);
            completion = await groq.chat.completions.create({
                model: MODEL_NAME,
                messages: buildInitialMessages(coreMessages, stage, currentContext, selectedBlockId),
                tools: [UPDATE_CONTEXT_TOOL],
                tool_choice: 'auto'
            });
        } catch (error: any) {
            if (error.status === 429) {
                console.warn(`[DiscoveryService] Rate limit hit for ${MODEL_NAME}. Falling back to ${FALLBACK_MODEL_NAME}...`);
                completion = await groq.chat.completions.create({
                    model: FALLBACK_MODEL_NAME,
                    messages: buildInitialMessages(coreMessages, stage, currentContext, selectedBlockId),
                    tools: [UPDATE_CONTEXT_TOOL],
                    tool_choice: 'auto'
                });
            } else {
                throw error;
            }
        }

        const choice = completion.choices[0];
        const message = choice.message;

        // 2. Procesar tool calls si existen
        const toolResults = message.tool_calls && message.tool_calls.length > 0
            ? processToolCalls(message.tool_calls)
            : [];

        // PERSISTENCIA SERVIDOR: Guardar cambios inmediatamente
        if (toolResults.length > 0) {
            console.log('[DiscoveryService] Persisting context updates to DB...');

            const { ContextReducer } = await import('./context-reducer');
            let mergedContext = { ...currentContext };

            toolResults.forEach(res => {
                if (res.toolName === 'updateContext' && res.result.success) {
                    mergedContext = ContextReducer.merge(mergedContext, res.args as any);
                }
            });

            // Guardar en Supabase
            // TODO: Integrar ID real de lección/sesión desde el orquestador
            await saveDiscoveryContext('draft-exam', mergedContext)
                .then(res => console.log('[DiscoveryService] DB Save result:', res))
                .catch(err => console.error('[DiscoveryService] DB Save failed:', err));

            // Actualizar currentContext para el follow-up loop
            currentContext = mergedContext;
        }

        // 3. Determinar si necesitamos follow-up para obtener respuesta de texto
        let assistantContent = message.content || '';

        if (shouldMakeFollowUp(toolResults, message.content)) {
            console.log('[DiscoveryService] Making follow-up call for text response...');

            const followUp = await groq.chat.completions.create({
                model: MODEL_NAME,
                messages: buildFollowUpMessages(coreMessages, message.tool_calls!, toolResults, stage, currentContext, selectedBlockId),
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
