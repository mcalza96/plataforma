import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { BloomLevel } from '@/lib/domain/assessment';
import { MODEL_NAME, SYSTEM_PROMPT, buildAnalysisPrompt } from './constants';
import { mapToBloomLevel } from './bloom-mapper';
import type { ContentAnalysisResult } from './types';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * Schema de validación para la respuesta de la IA
 */
const AnalysisSchema = z.object({
    bloom_level: z.string(),
    skills: z.array(z.string())
});

/**
 * Servicio para analizar contenido pedagógico y extraer metadatos
 */
export class MetadataService {
    /**
     * Analiza una descripción de contenido y retorna nivel Bloom y habilidades
     */
    async analyzeContent(description: string): Promise<ContentAnalysisResult> {
        try {
            const model = groq(MODEL_NAME);

            const { object } = await generateObject({
                model,
                system: SYSTEM_PROMPT,
                prompt: buildAnalysisPrompt(description),
                schema: AnalysisSchema,
            });

            // Mapear el nivel de Bloom de string a enum
            const bloomLevel = mapToBloomLevel(object.bloom_level);

            return {
                bloom_level: bloomLevel,
                skills: object.skills || []
            };

        } catch (error) {
            console.error('[MetadataService] Error analyzing content:', error);

            // Fallback por defecto en caso de error
            return {
                bloom_level: BloomLevel.COMPRENSION,
                skills: ['Exploración Inicial']
            };
        }
    }
}
