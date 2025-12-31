import type Groq from 'groq-sdk';
import type { ToolCallResult, ToolCallArguments } from './types';

/**
 * Procesa los tool calls de Groq y retorna resultados estructurados
 */
export function processToolCalls(
    toolCalls: Groq.Chat.ChatCompletionMessageToolCall[]
): ToolCallResult[] {
    const results: ToolCallResult[] = [];

    for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'updateContext') {
            const args: ToolCallArguments = JSON.parse(toolCall.function.arguments);

            console.log('[ToolProcessor] Context Updated:', JSON.stringify(args, null, 2));

            results.push({
                toolCallId: toolCall.id,
                toolName: toolCall.function.name,
                args: args,
                result: {
                    success: true,
                    updatedFields: Object.keys(args)
                }
            });
        }
    }

    return results;
}

/**
 * Determina si se debe hacer un follow-up call para obtener respuesta de texto
 */
export function shouldMakeFollowUp(toolResults: ToolCallResult[], content: string | null): boolean {
    return toolResults.length > 0 && !content;
}
