'use server';

import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { CompetencyNode } from '../../../domain/competency';
import { ProbeOption, ProbeType } from '../../../domain/assessment';
import { type PartialKnowledgeMap } from '../../../domain/discovery';
import { PrototypeSchema, type PrototypeGenerationResult, ProbeGenerationSchema, ProbeGenerationResult } from './schemas';
import { buildCompetencyProbePrompt, buildContextProbePrompt } from './prompts';

/**
 * Lazily initializes the model to ensure environment variables are loaded.
 */
function getModel(useFallback: boolean = false) {
    const groqApiKey = process.env.GROQ_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (groqApiKey) {
        const groq = createGroq({ apiKey: groqApiKey });
        return groq(useFallback ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile');
    }

    if (openaiApiKey) {
        const openai = createOpenAI({ apiKey: openaiApiKey });
        return openai('gpt-4o');
    }

    throw new Error('No AI provider API keys found (GROQ_API_KEY or OPENAI_API_KEY)');
}

/**
 * Genera un probe basado en una competencia y sus misconceptions
 */
export async function generateProbe(
    competency: CompetencyNode,
    misconceptions: CompetencyNode[]
) {
    const systemPrompt = buildCompetencyProbePrompt(competency, misconceptions);
    const model = getModel();

    const { object } = await generateObject({
        model,
        system: systemPrompt,
        schema: ProbeGenerationSchema,
        prompt: `Genera un instrumento de evaluación de alta fidelidad para la competencia "${competency.title}".`
    });

    return {
        competencyId: competency.id,
        type: object.type as ProbeType,
        stem: object.stem,
        options: object.options.map((o: any) => new ProbeOption(
            o.content,
            o.isCorrect,
            o.feedback,
            o.diagnosesMisconceptionId
        )),
        metadata: {}
    };
}

/**
 * Genera un probe basado en el knowledge graph extraído del arquitecto
 */
export async function generateProbeFromContext(
    context: PartialKnowledgeMap
) {
    const systemPrompt = buildContextProbePrompt(context);
    const model = getModel();

    try {
        const { object } = await generateObject({
            model,
            system: systemPrompt,
            schema: ProbeGenerationSchema,
            prompt: `Genera una pregunta de diagnóstico experta sobre "${context.subject}" para una audiencia de "${context.targetAudience}".`,
            temperature: 0.1,
        });

        return {
            type: object.type as ProbeType,
            stem: object.stem,
            options: object.options.map((o: any) => new ProbeOption(
                o.content,
                o.isCorrect,
                o.feedback,
                o.diagnosesMisconceptionId
            )),
            metadata: {
                generatedFromArchitect: true,
                pedagogicalGoal: context.pedagogicalGoal,
                observerGuide: object.observer_guide
            }
        };
    } catch (error: any) {
        if (error.status === 429) {
            console.warn(`[Generator] Rate limit hit. Falling back to 8b...`);
            const fallbackModel = getModel(true);
            const { object } = await generateObject({
                model: fallbackModel,
                system: systemPrompt,
                schema: ProbeGenerationSchema,
                prompt: `Genera una pregunta de diagnóstico experta sobre "${context.subject}" para una audiencia de "${context.targetAudience}".`,
                temperature: 0.1,
            });
            return {
                type: object.type as ProbeType,
                stem: object.stem,
                options: object.options.map((o: any) => new ProbeOption(
                    o.content,
                    o.isCorrect,
                    o.feedback,
                    o.diagnosesMisconceptionId
                )),
                metadata: {
                    generatedFromArchitect: true,
                    pedagogicalGoal: context.pedagogicalGoal,
                    observerGuide: object.observer_guide
                }
            };
        }
        throw error;
    }
}

/**
 * Genera una lista de prototipos (borradores) basados en el contexto completo
 */
export async function generatePrototypesFromContext(
    context: PartialKnowledgeMap
): Promise<PrototypeGenerationResult> {
    const systemPrompt = `Eres un experto en diseño de instrumentos de evaluación diagnóstica.
Tu objetivo es generar 3 prototipos de preguntas que validen los conceptos clave y detecten las ideas erróneas identificadas.

CONTEXTO:
- Materia: ${context.subject || 'TBD'}
- Audiencia: ${context.targetAudience || 'TBD'}
- Perfil: ${context.studentProfile || 'TBD'}
- Conceptos Clave: ${context.keyConcepts?.join(', ') || 'TBD'}
- Misconceptions: ${context.identifiedMisconceptions?.map(m => m.error).join('; ') || 'TBD'}

REQUISITOS:
1. Cada pregunta debe tener una intención pedagógica clara.
2. Debes incluir "rationale" para cada opción (por qué es correcta o por qué es un distractor).
3. El tono debe ser adecuado para la audiencia especificada.`;

    const model = getModel();

    try {
        const { object } = await generateObject({
            model,
            system: systemPrompt,
            schema: PrototypeSchema,
            prompt: `Genera 3 prototipos de preguntas de diagnóstico (Legos) para "${context.subject}".`,
            temperature: 0.1,
        });

        return object;
    } catch (error: any) {
        if (error.status === 429) {
            console.warn(`[Generator] Rate limit hit in prototypes. Falling back to 8b...`);
            const fallbackModel = getModel(true);
            const { object } = await generateObject({
                model: fallbackModel,
                system: systemPrompt,
                schema: PrototypeSchema,
                prompt: `Genera 3 prototipos de preguntas de diagnóstico (Legos) para "${context.subject}".`,
                temperature: 0.1,
            });
            return object;
        }
        console.error("[Generator] Failed to generate prototypes with schema:", error);
        throw error;
    }
}
