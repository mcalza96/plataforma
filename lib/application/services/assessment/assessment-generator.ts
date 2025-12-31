'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { CompetencyNode } from '../../../domain/competency';
import { DiagnosticProbe, ProbeOption, ProbeType } from '../../../domain/assessment';
import { type PartialKnowledgeMap } from '../../../domain/discovery';
import { ProbeGenerationSchema } from './schemas';
import { buildCompetencyProbePrompt, buildContextProbePrompt } from './prompts';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
});

const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Servicio para generar instrumentos de evaluación diagnóstica usando IA
 */

/**
 * Genera un probe basado en una competencia y sus misconceptions
 */
export async function generateProbe(
    competency: CompetencyNode,
    misconceptions: CompetencyNode[]
): Promise<Partial<DiagnosticProbe>> {
    const model = groq(MODEL_NAME);
    const systemPrompt = buildCompetencyProbePrompt(competency, misconceptions);

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
 * Genera un probe basado en el knowledge graph extraído del arquitecto
 * Esta es la función core de "Distractor Engineering"
 */
export async function generateProbeFromContext(
    context: PartialKnowledgeMap
): Promise<Partial<DiagnosticProbe>> {
    const model = groq(MODEL_NAME);
    const systemPrompt = buildContextProbePrompt(context);

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
            pedagogicalGoal: context.pedagogicalGoal,
            observerGuide: object.observer_guide  // ✨ NUEVO: Persistir la guía del observador
        }
    };
}
