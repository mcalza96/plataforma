import { BloomLevel } from '../../../domain/entities/course';

/**
 * Resultado del análisis de contenido
 */
export interface ContentAnalysisResult {
    bloom_level: BloomLevel;
    skills: string[];
}

/**
 * Respuesta de la IA (antes de mapear)
 */
export interface AnalysisResponse {
    bloom_level: string;
    skills: string[];
}
