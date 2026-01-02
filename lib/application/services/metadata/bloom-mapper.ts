import { BloomLevel } from '@/lib/domain/assessment';

/**
 * Mapea el nivel de Bloom de texto a enum
 */
export function mapToBloomLevel(level: string): BloomLevel {
    const normalized = level.toLowerCase();

    if (normalized.includes('recordar')) return BloomLevel.RECUERDO;
    if (normalized.includes('comprender')) return BloomLevel.COMPRENSION;
    if (normalized.includes('aplicar')) return BloomLevel.APLICACION;
    if (normalized.includes('analizar')) return BloomLevel.ANALISIS;
    if (normalized.includes('evaluar')) return BloomLevel.EVALUACION;
    if (normalized.includes('crear')) return BloomLevel.CREACION;

    // Fallback
    return BloomLevel.COMPRENSION;
}
