import type Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from './constants';
import type { GroqMessage, ToolCallResult } from './types';

/**
 * Construye los mensajes iniciales para la llamada a Groq
 */
export function buildInitialMessages(coreMessages: any[]): GroqMessage[] {
    return [
        { role: 'system', content: SYSTEM_PROMPT },
        ...coreMessages.map((m: any) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
        }))
    ];
}

/**
 * Construye los mensajes para el follow-up después de ejecutar tool calls
 */
export function buildFollowUpMessages(
    coreMessages: any[],
    toolCalls: Groq.Chat.ChatCompletionMessageToolCall[],
    toolResults: ToolCallResult[]
): GroqMessage[] {
    return [
        { role: 'system', content: SYSTEM_PROMPT },
        ...coreMessages.map((m: any) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
        })),
        // El mensaje del asistente que incluye el tool call
        {
            role: 'assistant' as const,
            tool_calls: toolCalls.map(tc => ({
                id: tc.id,
                type: 'function' as const,
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments
                }
            }))
        },
        // Los resultados de las herramientas
        ...toolResults.map(tr => ({
            role: 'tool' as const,
            tool_call_id: tr.toolCallId,
            content: JSON.stringify(tr.result)
        }))
    ];
}
