/**
 * Assessment Generator - Generación de Instrumentos Diagnósticos
 * Re-exporta funciones de generación para mantener compatibilidad
 */
export { generateProbe, generateProbeFromContext, generatePrototypesFromContext } from './assessment-generator';
export { ProbeGenerationSchema, PrototypeSchema } from './schemas';
export type { ProbeGenerationResult, PrototypeGenerationResult } from './schemas';
