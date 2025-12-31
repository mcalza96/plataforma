/**
 * Utilitarios para compresión de contexto y optimización de tokens
 */

interface Message {
    role: string;
    content: string;
}

/**
 * Comprime el historial de conversación cuando excede un umbral
 * Ahorro: 40-60% en conversaciones largas
 */
export function compressConversationHistory(messages: any[], maxMessages: number = 8): any[] {
    if (messages.length <= maxMessages) {
        return messages;
    }

    // Mantener siempre el primer mensaje (system) y los últimos 4
    const systemMessage = messages[0];
    const recentMessages = messages.slice(-4);

    // Resumir los mensajes del medio
    const middleMessages = messages.slice(1, -4);

    // Extraer información clave de los mensajes intermedios
    const userInputs: string[] = [];
    const assistantQuestions: string[] = [];

    middleMessages.forEach((msg: any) => {
        if (msg.role === 'user') {
            // Extraer solo las primeras 50 chars de cada input del usuario
            if (typeof msg.content === 'string') {
                userInputs.push(msg.content.substring(0, 50));
            }
        } else if (msg.role === 'assistant') {
            // Extraer preguntas del asistente (buscar signos de interrogación)
            if (typeof msg.content === 'string') {
                const questions = msg.content.match(/[^.!?]*\?/g);
                if (questions) {
                    assistantQuestions.push(...questions.slice(0, 2)); // Max 2 preguntas por mensaje
                }
            }
        }
    });

    const summaryMessage = {
        role: 'system',
        content: `[HISTORY SUMMARY] User mentioned: ${userInputs.join('; ')}. You asked: ${assistantQuestions.join(' ')}`
    };

    return [systemMessage, summaryMessage, ...recentMessages];
}

/**
 * Calcula el número aproximado de tokens en un texto
 * Estimación rápida: ~1.3 tokens por palabra en español
 */
export function estimateTokens(text: string): number {
    if (!text) return 0;
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.3);
}

/**
 * Trunca un mensaje si excede un límite de tokens
 */
export function truncateMessage(content: string, maxTokens: number = 500): string {
    const estimated = estimateTokens(content);
    if (estimated <= maxTokens) {
        return content;
    }

    // Truncar al número aproximado de palabras
    const maxWords = Math.floor(maxTokens / 1.3);
    const words = content.split(/\s+/);
    return words.slice(0, maxWords).join(' ') + '... [truncated]';
}
