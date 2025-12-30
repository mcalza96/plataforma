'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CompetencyNode } from '../../domain/competency';
import { DiagnosticProbe, ProbeOption, ProbeType } from '../../domain/assessment';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Result schema for AI generation
 */
const ProbeGenerationSchema = z.object({
    type: z.enum(['multiple_choice_rationale', 'phenomenological_checklist']),
    stem: z.string(),
    options: z.array(z.object({
        content: z.string(),
        isCorrect: z.boolean(),
        feedback: z.string().optional(),
        diagnosesMisconceptionId: z.string().nullable().optional()
    }))
});

/**
 * Service to generate diagnostic instruments using AI.
 */
export async function generateProbe(competency: CompetencyNode, misconceptions: CompetencyNode[]): Promise<Partial<DiagnosticProbe>> {
    const model = groq('llama-3.3-70b-versatile');

    const misconceptionsContext = misconceptions.map(m => `- ID: ${m.id}\n  Error: ${m.title}\n  Lógica: ${m.metadata.errorLogic}\n  Refutación: ${m.metadata.refutationStrategy}`).join('\n');

    const systemPrompt = `
Eres un Psicometrista Experto y Diseñador Instruccional Senior. 
Tu misión es generar un "Instrumento de Evaluación Diagnóstica" para detectar brechas y errores conceptuales (misconceptions) en alumnos.

COMPETENCIA A EVALUAR:
- Título: ${competency.title}
- Descripción: ${competency.description}

ERRORES CONCEPTUALES CONOCIDOS (Misconceptions):
${misconceptionsContext}

REGLAS DE GENERACIÓN:
1. Si la competencia es teórica, genera 'multiple_choice_rationale'. 
   - Opción Correcta: Debe ser clara y precisa.
   - Distractor Crítico: DEBE ser la consecuencia lógica de uno de los errores conceptuales listados arriba. Asocia el 'diagnosesMisconceptionId' correspondiente.
   - Distractor Común: Un error típico (ej: error de cálculo) con feedback explicativo.
2. Si la competencia es práctica/manual, genera 'phenomenological_checklist'.
   - Descompón el desempeño en ítems binarios (Checklist). 
   - Cada ítem debe ser un observable claro.
   - Si no se cumple, asocia el error conceptual que se estaría manifestando.
3. El feedback debe ser empático y explicar el "por qué" de la falla basada en la lógica del error detectado.
`;

    const { object } = await generateObject({
        model,
        system: systemPrompt,
        prompt: `Genera un instrumento de evaluación de alta fidelidad para la competencia "${competency.title}".`,
        schema: ProbeGenerationSchema,
    });

    return {
        competencyId: competency.id,
        type: object.type as ProbeType,
        stem: object.stem,
        options: object.options.map(o => new ProbeOption(
            o.content,
            o.isCorrect,
            o.feedback,
            o.diagnosesMisconceptionId
        )),
        metadata: {}
    };
}
