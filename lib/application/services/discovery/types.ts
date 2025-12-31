import type Groq from 'groq-sdk';

/**
 * Argumentos que puede recibir la herramienta updateContext
 */
export interface ToolCallArguments {
    subject?: string;
    targetAudience?: string;
    keyConcepts?: string[];
    identifiedMisconceptions?: Array<{
        error: string;
        refutation: string;
    }>;
    pedagogicalGoal?: string;
}

/**
 * Resultado del procesamiento de un tool call
 */
export interface ToolCallResult {
    toolCallId: string;
    toolName: string;
    args: ToolCallArguments;
    result: {
        success: boolean;
        updatedFields: string[];
    };
}

/**
 * Mensaje en formato Groq
 */
export type GroqMessage =
    | { role: 'system'; content: string }
    | { role: 'user'; content: string }
    | { role: 'assistant'; content?: string; tool_calls?: Groq.Chat.ChatCompletionMessageToolCall[] }
    | { role: 'tool'; tool_call_id: string; content: string };

/**
 * Respuesta del servicio de discovery
 */
export interface DiscoveryResponse {
    role: 'assistant';
    content: string;
    toolCalls: ToolCallResult[];
}
