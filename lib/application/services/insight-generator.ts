'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { AssessmentResult, PathMutation } from '../../domain/triage';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export interface InsightCard {
    title: string;
    explanation: string;
    action: string;
}

const InsightSchema = z.object({
    title: z.string(),
    explanation: z.string(),
    action: z.string()
});

/**
 * Service to translate technical data into human pedagogical insights.
 */
export async function generateInsight(
    result: AssessmentResult,
    mutation: PathMutation,
    context: { studentName: string; competencyTitle: string }
): Promise<InsightCard> {
    const model = groq('llama-3.3-70b-versatile');

    const systemPrompt = `
Eres un Asistente Senior de Análisis Pedagógico. 
Tu objetivo es traducir datos técnicos de IA y resultados de exámenes en consejos humanos y claros para un profesor.

CONTEXTO:
- Alumno: ${context.studentName}
- Competencia: ${context.competencyTitle}
- Acción de la IA: ${mutation.action}
- Razón Técnica: ${mutation.reason}

INSTRUCCIONES:
1. Redacta un título corto y directo.
2. Explica qué error conceptual se detectó y POR QUÉ es importante (usa un tono empático y profesional).
3. Describe la acción recomendada de forma clara.

EVITA tecnicismos como "JSON", "mutation", "FK" o "ID".
`;

    const { object } = await generateObject({
        model,
        system: systemPrompt,
        prompt: `Genera una tarjeta de insight para el profesor sobre el desempeño de ${context.studentName} en "${context.competencyTitle}".`,
        schema: InsightSchema,
    });

    return object;
}
