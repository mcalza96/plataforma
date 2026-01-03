import { generateObject } from 'ai';
import { CompetencyNode } from '../../../domain/competency';
import { ProbeOption, ProbeType } from '../../../domain/assessment';
import { type PartialKnowledgeMap } from '../../../domain/discovery';
import { PrototypeSchema, type PrototypeGenerationResult, ProbeGenerationSchema, ProbeGenerationResult } from './schemas';
import { buildCompetencyProbePrompt, buildContextProbePrompt } from './prompts';
import { AIProvider } from '@/lib/infrastructure/ai/ai-provider';

/**
 * Genera un probe basado en una competencia y sus misconceptions
 */
export async function generateProbe(
    competency: CompetencyNode,
    misconceptions: CompetencyNode[]
) {
    const systemPrompt = buildCompetencyProbePrompt(competency, misconceptions);
    const model = AIProvider.getModel();

    const { object } = await generateObject({
        model,
        system: systemPrompt,
        schema: ProbeGenerationSchema,
        prompt: `Genera un instrumento de evaluación de alta fidelidad para la competencia "${competency.title}".`,
        experimental_telemetry: { isEnabled: false },
        // @ts-ignore - Disable strict mode for Groq compatibility
        experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
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
    const model = AIProvider.getModel();

    try {
        const { object } = await generateObject({
            model,
            system: systemPrompt,
            schema: ProbeGenerationSchema,
            prompt: `Genera una pregunta de diagnóstico experta sobre "${context.subject}" para una audiencia de "${context.targetAudience}".`,
            temperature: 0.1,
            experimental_telemetry: { isEnabled: false },
            // @ts-ignore - Disable strict mode for Groq compatibility
            experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
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
            },
            expected_time_seconds: object.expected_time_seconds,
            min_viable_time: object.min_viable_time
        };
    } catch (error: any) {
        if (error.status === 429) {
            console.warn(`[Generator] Rate limit hit. Falling back to smaller model...`);
            const fallbackModel = AIProvider.getModel({ useFallback: true });
            const { object } = await generateObject({
                model: fallbackModel,
                system: systemPrompt,
                schema: ProbeGenerationSchema,
                prompt: `Genera una pregunta de diagnóstico experta sobre "${context.subject}" para una audiencia de "${context.targetAudience}".`,
                temperature: 0.1,
                experimental_telemetry: { isEnabled: false },
                // @ts-ignore - Disable strict mode for Groq compatibility
                experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
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
                },
                expected_time_seconds: object.expected_time_seconds,
                min_viable_time: object.min_viable_time
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

    const model = AIProvider.getModel();

    try {
        const { object } = await generateObject({
            model,
            system: systemPrompt,
            schema: PrototypeSchema,
            prompt: `Genera 3 prototipos de preguntas de diagnóstico (Legos) para "${context.subject}".`,
            temperature: 0.1,
            experimental_telemetry: { isEnabled: false },
            // @ts-ignore - Disable strict mode for Groq compatibility
            experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
        });

        return object;
    } catch (error: any) {
        if (error.status === 429) {
            console.warn(`[Generator] Rate limit hit in prototypes. Falling back to smaller model...`);
            const fallbackModel = AIProvider.getModel({ useFallback: true });
            const { object } = await generateObject({
                model: fallbackModel,
                system: systemPrompt,
                schema: PrototypeSchema,
                prompt: `Genera 3 prototipos de preguntas de diagnóstico (Legos) para "${context.subject}".`,
                temperature: 0.1,
                experimental_telemetry: { isEnabled: false },
                // @ts-ignore - Disable strict mode for Groq compatibility
                experimental_providerMetadata: AIProvider.getGroqStructuredMetadata()
            });
            return object;
        }
        console.error("[Generator] Failed to generate prototypes with schema:", error);
        throw error;
    }
}
