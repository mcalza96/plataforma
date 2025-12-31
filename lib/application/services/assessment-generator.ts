'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CompetencyNode } from '../../domain/competency';
import { DiagnosticProbe, ProbeOption, ProbeType } from '../../domain/assessment';
import { type PartialKnowledgeMap } from '../../domain/discovery';

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

/**
 * Generates a diagnostic probe based on the knowledge graph extracted from the architect interview.
 * This is the core of "Distractor Engineering".
 */
export async function generateProbeFromContext(context: PartialKnowledgeMap): Promise<Partial<DiagnosticProbe>> {
    const model = groq('llama-3.3-70b-versatile');

    const misconceptionsContext = context.identifiedMisconceptions?.map((m, idx) =>
        `ERROR ${idx + 1}: ${m.error}\nREFUTACIÓN: ${m.refutation}`
    ).join('\n\n') || 'Ninguno detectado';

    const systemPrompt = `
Eres un Diseñador Psicometrista Senior de TeacherOS. 
Tu especialidad es la "Ingeniería de Distractores": crear preguntas donde las opciones incorrectas no son aleatorias, sino que validan malentendidos específicos.

ESTRATEGIA DE DISEÑO:
1. Analiza el SUJETO y la AUDIENCIA.
2. Genera una pregunta tipo 'multiple_choice_rationale'.
3. LA REGLA DE ORO DE LOS DISTRACTORES:
   - Al menos un distractor DEBE estar diseñado para ser la respuesta que elegiría un alumno que tiene este malentendido específico:
   ---
   ${misconceptionsContext}
   ---
4. El feedback de ese distractor debe explicar por qué esa lógica es errónea basándose en la refutación proporcionada.
`;

    const result = await generateObject({
        model,
        system: systemPrompt,
        prompt: `Genera una pregunta de diagnóstico experta sobre "${context.subject}" para una audiencia de "${context.targetAudience}".`,
        schema: ProbeGenerationSchema,
    });

    const object = result.object;

    return {
        type: object.type as ProbeType,
        stem: object.stem,
        options: object.options.map(o => new ProbeOption(
            o.content,
            o.isCorrect,
            o.feedback,
            o.diagnosesMisconceptionId
        )),
        metadata: {
            generatedFromArchitect: true,
            pedagogicalGoal: context.pedagogicalGoal
        }
    };
}
