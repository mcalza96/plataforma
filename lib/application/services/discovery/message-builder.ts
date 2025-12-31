import { buildArchitectPrompt } from '@/lib/ai/prompts';

interface PartialKnowledgeMap {
    subject?: string;
    targetAudience?: string;
    pedagogicalGoal?: string;
    keyConcepts?: string[];
    identifiedMisconceptions?: Array<{
        error: string;
        distractor_artifact?: string;
        refutation?: string;
    }>;
}

/**
 * Construye el bloque de "Memoria de Trabajo" COMPRIMIDO
 * Versión optimizada: ~80 tokens vs ~400 tokens de la versión verbosa
 */
function buildStructuredMemory(context: any): string {
    // Normalización de campos legacy vs nuevos
    const concepts = context.keyConcepts ||
        (Array.isArray(context.concepts) ? context.concepts.map((c: any) => c.name || c) : []);

    const misconceptions = context.identifiedMisconceptions ||
        context.misconceptions ||
        [];

    const conceptCount = concepts.length;
    const misconceptionCount = misconceptions.length;

    // Calcular estado de cobertura
    const hasTargetAudience = !!context.targetAudience;
    const hasEnoughConcepts = conceptCount >= 3;
    const hasEnoughMisconceptions = misconceptionCount >= 1;
    const isComplete = hasTargetAudience && hasEnoughConcepts && hasEnoughMisconceptions;

    // Calcular porcentaje aproximado
    let progress = 0;
    if (context.subject) progress += 10;
    if (hasTargetAudience) progress += 10;
    if (context.pedagogicalGoal) progress += 10;
    progress += Math.min(conceptCount * 13, 40);
    progress += Math.min(misconceptionCount * 30, 30);

    // Formato ultra-comprimido
    const parts = [
        `[BLUEPRINT v${Date.now()}]`,
        `Subject: ${context.subject || 'TBD'}`,
        `Audience: ${context.targetAudience || 'TBD'}`,
        `Goal: ${context.pedagogicalGoal || 'TBD'}`,
        `Concepts (${conceptCount}/3): ${concepts.join(', ') || 'none'}`,
        `Misconceptions (${misconceptionCount}/1): ${misconceptionCount > 0
            ? misconceptions.map((m: any) => m.error).join('; ')
            : 'none'}`,
        `Progress: ${progress}% | Complete: ${isComplete ? 'YES' : 'NO'}`,
        ``,
        `RULES: (1) Don't ask about fields already set above. (2) Focus on missing data. (3) NEVER mention updateContext in your response.`
    ];

    return parts.join('\n');
}

/**
 * Construye los mensajes iniciales para la primera llamada a Groq
 */
export function buildInitialMessages(
    coreMessages: any[],
    stage: string,
    currentContext?: PartialKnowledgeMap
): any[] {
    const systemPrompt = buildArchitectPrompt(stage);

    const messages: any[] = [
        {
            role: 'system',
            content: systemPrompt
        }
    ];

    // Inyectar la "Verdad Estructurada" si hay contexto previo
    if (currentContext && (currentContext.subject || currentContext.keyConcepts?.length || currentContext.identifiedMisconceptions?.length)) {
        messages.push({
            role: 'system',
            content: buildStructuredMemory(currentContext)
        });
    }

    // Agregar los mensajes de la conversación
    messages.push(...coreMessages);

    return messages;
}

/**
 * Construye los mensajes para la llamada de follow-up
 */
export function buildFollowUpMessages(
    coreMessages: any[],
    toolCalls: any[],
    toolResults: any[],
    stage: string,
    currentContext?: PartialKnowledgeMap
): any[] {
    const systemPrompt = buildArchitectPrompt(stage);

    const messages: any[] = [
        {
            role: 'system',
            content: systemPrompt
        }
    ];

    // Inyectar contexto actualizado
    if (currentContext) {
        messages.push({
            role: 'system',
            content: buildStructuredMemory(currentContext)
        });
    }

    // Agregar conversación previa
    messages.push(...coreMessages);

    // Agregar el mensaje del asistente con tool calls
    messages.push({
        role: 'assistant',
        content: null,
        tool_calls: toolCalls
    });

    // Agregar los resultados de las herramientas
    for (const result of toolResults) {
        messages.push({
            role: 'tool',
            tool_call_id: result.toolCallId,
            content: JSON.stringify(result.result)
        });
    }

    return messages;
}
