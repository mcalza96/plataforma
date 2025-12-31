/**
 * Evaluation & Inference Domain Types
 * 
 * Este módulo define el contrato de datos para el Motor de Inferencia.
 * Incluye las estructuras de evidencia (respuestas + telemetría) y
 * los resultados del diagnóstico (capas de juicio clínico).
 */

import { z } from 'zod';

// ============================================================================
// INPUT: EVIDENCIA DE EVALUACIÓN
// ============================================================================

/**
 * Niveles de certeza reportados por el estudiante (CBM)
 */
export const ConfidenceLevelSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * Telemetría detallada de una respuesta individual
 */
export const ResponseTelemetrySchema = z.object({
    timeMs: z.number(),           // Tiempo total en la pregunta
    hesitationCount: z.number(),  // Cantidad de veces que cambió de opción
    hoverTimeMs: z.number(),      // Tiempo de hover sobre la opción seleccionada
    isRapidGuessing: z.boolean().optional(), // Detectado por el behavior-detector
});

/**
 * Respuesta del estudiante a un ítem
 */
export const StudentResponseSchema = z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
    isCorrect: z.boolean(),
    confidence: ConfidenceLevelSchema,
    telemetry: ResponseTelemetrySchema,
});

export type StudentResponse = z.infer<typeof StudentResponseSchema>;

/**
 * Mapeo de la Matriz Q para evaluación
 */
export const QMatrixMappingSchema = z.object({
    questionId: z.string(),
    competencyId: z.string(),
    misconceptionId: z.string().optional(), // Si es una "pregunta trampa"
    isTrap: z.boolean().default(false),
    trapOptionId: z.string().optional(),     // ID de la opción que dispara el misconception
    idDontKnowOptionId: z.string().optional(), // ID de la opción "No lo sé"
});

export type QMatrixMapping = z.infer<typeof QMatrixMappingSchema>;

// ============================================================================
// OUTPUT: RESULTADO DEL DIAGNÓSTICO (El Juez)
// ============================================================================

/**
 * Estados posibles de una competencia según la inferencia
 */
export const CompetencyEvaluationStateSchema = z.enum([
    'MASTERED',      // Domina el concepto
    'GAP',           // Falta de conocimiento (Ignorancia)
    'MISCONCEPTION', // Error conceptual (Bug)
    'UNKNOWN',       // No hay evidencia suficiente
]);

export type CompetencyEvaluationState = z.infer<typeof CompetencyEvaluationStateSchema>;

/**
 * Perfil conductual detectado a través de la telemetría
 */
export const BehaviorProfileSchema = z.object({
    isImpulsive: z.boolean(), // Tendencia a responder demasiado rápido
    isAnxious: z.boolean(),   // Tendencia a dudar mucho (hesitation)
    isConsistent: z.boolean(), // Congruencia entre confianza y acierto
});

export type BehaviorProfile = z.infer<typeof BehaviorProfileSchema>;

/**
 * Evidencia que respalda un juicio diagnóstico
 */
export const DiagnosisEvidenceSchema = z.object({
    reason: z.string(),
    confidenceScore: z.number(), // 0 a 1
    sourceQuestionIds: z.array(z.string()),
});

/**
 * Diagnóstico completo de una competencia
 */
export const CompetencyDiagnosisSchema = z.object({
    competencyId: z.string(),
    state: CompetencyEvaluationStateSchema,
    evidence: DiagnosisEvidenceSchema,
    remedialContentIds: z.array(z.string()), // IDs de lecciones/recursos para esta competencia
});

/**
 * Resultado global de la sesión de evaluación
 */
export const DiagnosticResultSchema = z.object({
    attemptId: z.string(),
    studentId: z.string(),
    overallScore: z.number(),
    behaviorProfile: BehaviorProfileSchema,
    competencyDiagnoses: z.array(CompetencyDiagnosisSchema),
    timestamp: z.date(),
});

export type DiagnosticResult = z.infer<typeof DiagnosticResultSchema>;
export type CompetencyDiagnosis = z.infer<typeof CompetencyDiagnosisSchema>;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Mapeo de prioridades para sobrescritura de estados
 */
export const EVALUATION_PRIORITY: Record<CompetencyEvaluationState, number> = {
    MISCONCEPTION: 3, // Máxima prioridad diagnóstica
    MASTERED: 2,
    GAP: 1,
    UNKNOWN: 0,
};
