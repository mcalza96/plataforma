import { z } from 'zod';

export enum BloomLevel {
    RECUERDO = 'Recordar',
    COMPRENSION = 'Comprender',
    APLICACION = 'Aplicar',
    ANALISIS = 'Analizar',
    EVALUACION = 'Evaluar',
    CREACION = 'Crear'
}

/**
 * Assessment types for Diagnostic Probes
 */
export type ProbeType = 'multiple_choice_rationale' | 'phenomenological_checklist';

/**
 * ProbeOption Value Object
 * Represents a choice in a multiple-choice question or an item in a checklist.
 */
export class ProbeOption {
    constructor(
        public readonly content: string,
        public readonly isCorrect: boolean,
        public readonly feedback: string | null = null,
        public readonly diagnosesMisconceptionId: string | null = null,
        public readonly isGap: boolean = false, // Added for explicit gap tracking in Domain Object
        public readonly id?: string
    ) {
        // Business Rule: If it's a distractor, it should ideally have a misconception link or generic feedback
        if (!isCorrect && !diagnosesMisconceptionId && !feedback) {
            console.warn(`Distractor without misconception link or feedback: ${content}`);
        }
    }
}

/**
 * DiagnosticProbe Entity
 * Represents a psychometric instrument linked to a competency.
 */
export class DiagnosticProbe {
    constructor(
        public readonly id: string,
        public readonly competencyId: string,
        public readonly type: ProbeType,
        public readonly stem: string,
        public readonly options: ProbeOption[],
        public readonly metadata: Record<string, any> = {},
        public readonly createdAt?: Date
    ) { }

    /**
     * Business Rule: Validates that the probe has the minimum required structure
     */
    public isValid(): boolean {
        if (this.type === 'multiple_choice_rationale') {
            return this.options.length >= 2 && this.options.some(o => o.isCorrect);
        }
        if (this.type === 'phenomenological_checklist') {
            return this.options.length >= 1;
        }
        return false;
    }
}

/**
 * Repository Interface for Assessment
 */
export interface IAssessmentRepository {
    saveProbe(probe: DiagnosticProbe): Promise<void>;
    getProbesByCompetency(competencyId: string): Promise<DiagnosticProbe[]>;
    getProbeById(id: string): Promise<DiagnosticProbe | null>;
    deleteProbe(id: string): Promise<void>;
}

// --- Domain Schemas (Zod) ---

export const DiagnosisSchema = z.object({
    student_profile: z.object({
        age: z.coerce.number().min(3).max(99),
        style: z.string().min(3, 'El estilo de aprendizaje es requerido'),
    }),
    subject: z.string().min(3, 'La materia es requerida'),
    identified_gaps: z.array(z.string()).min(1, 'Debes identificar al menos una brecha de aprendizaje'),
});

export const ProposalSchema = z.object({
    suggested_title: z.string(),
    rationale: z.string(),
    modules: z.array(z.object({
        content_id: z.string().uuid(),
        order: z.number(),
        reason: z.string(),
    })),
});

// ============================================================================
// EVALUATION & INFERENCE TYPES (SSOT)
// ============================================================================

/**
 * Niveles de certeza reportados por el estudiante (CBM)
 */
export const ConfidenceLevelSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * Telemetría detallada de una respuesta individual
 * Consolidated schema for both raw capture and inference enrichment
 */
export const ResponseTelemetrySchema = z.object({
    timeMs: z.number(),           // Tiempo total en la pregunta
    hesitationCount: z.number(),  // Cantidad de veces que cambió de opción
    focusLostCount: z.number().default(0), // Cambios de ventana/tab
    hoverTimeMs: z.number().default(0),      // Tiempo de hover sobre la opción seleccionada
    confidence: ConfidenceLevelSchema.optional(),

    // Mobile / Decision Latency Metrics
    ttft: z.number().optional(),             // Time To First Touch (ms)
    confirmationLatency: z.number().optional(), // Time from last selection to confirm (ms)
    revisitCount: z.number().default(0),    // Number of times returned to this question

    // Inference / Derived Metrics
    isRapidGuessing: z.boolean().optional(), // Detectado por el behavior-detector
    rte: z.number().optional(),   // Response Time Effort (Time / Expected)
    zScore: z.number().optional(), // Standard Score relative to cohort
    expectedTime: z.number().optional(), // Snapshot baseline
});

export type ResponseTelemetry = z.infer<typeof ResponseTelemetrySchema>;

// Alias for backwards compatibility with legacy code calling it "TelemetryData"
export type TelemetryData = ResponseTelemetry;

/**
 * Respuesta del estudiante a un ítem
 */
export const StudentResponseSchema = z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
    isCorrect: z.boolean(),
    confidence: ConfidenceLevelSchema,
    isGap: z.boolean().optional(), // Added for explicit gap tracking
    telemetry: ResponseTelemetrySchema,
});

export type StudentResponse = z.infer<typeof StudentResponseSchema>;

/**
 * Answer payload sent when user completes a question
 * (Legacy interface kept for action payloads, mapped to StudentResponse)
 */
export interface AnswerPayload {
    questionId: string;
    value: any;
    isGap: boolean;
    telemetry: TelemetryData;
}

export const AnswerPayloadSchema = z.object({
    questionId: z.string(),
    value: z.any(),
    isGap: z.boolean().optional(), // Added for explicit gap tracking
    telemetry: ResponseTelemetrySchema, // Use the SSOT schema
});


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
    isTunnelVision: z.boolean().default(false), // Ineficiencia temporal extrema (>1.5 RTE)
});

export type BehaviorProfile = z.infer<typeof BehaviorProfileSchema>;

/**
 * Calibration metrics for metacognitive analysis
 */
export const CalibrationMetricsSchema = z.object({
    certaintyAverage: z.number(), // 0-100
    accuracyAverage: z.number(),  // 0-100
    eceScore: z.number(),         // Expected Calibration Error (0-100)
    calibrationStatus: z.enum(['CALIBRATED', 'OVERCONFIDENT', 'UNDERCONFIDENT']),
    blindSpots: z.number(),       // Count of High Confidence + Incorrect
    fragileKnowledge: z.number(), // Count of Low/Medium Confidence + Correct
});

export type CalibrationMetrics = z.infer<typeof CalibrationMetricsSchema>;

/**
 * Evidencia que respalda un juicio diagnóstico
 */
export const DiagnosisEvidenceSchema = z.object({
    reason: z.string(),
    confidenceScore: z.number(), // 0 a 1
    sourceQuestionIds: z.array(z.string()),
    misconceptionId: z.string().optional(), // ID del error específico detectado
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
    calibration: CalibrationMetricsSchema, // Add calibration for the Cognitive Mirror
    competencyDiagnoses: z.array(CompetencyDiagnosisSchema),
    timestamp: z.date(),
});

export type DiagnosticResult = z.infer<typeof DiagnosticResultSchema>;
export type CompetencyDiagnosis = z.infer<typeof CompetencyDiagnosisSchema>;

/**
 * Mapeo de prioridades para sobrescritura de estados
 */
export const EVALUATION_PRIORITY: Record<CompetencyEvaluationState, number> = {
    MISCONCEPTION: 3, // Máxima prioridad diagnóstica
    MASTERED: 2,
    GAP: 1,
    UNKNOWN: 0,
};

// ============================================================================
// QUESTION & LEGO TYPES
// ============================================================================

/**
 * Question types supported by the Lego system
 */
export type QuestionType = 'CBM' | 'RANKING' | 'SPOTTING';

/**
 * Base question interface
 */
export interface BaseQuestion {
    id: string;
    type: QuestionType;
    stem: string; // Question text
    // Time-Based Identity (TeacherOS Logic)
    expected_time_seconds?: number;
    min_viable_time?: number; // Rapid guessing threshold
    difficulty_tier?: 'easy' | 'medium' | 'hard';
}

/**
 * Calculates the Minimum Viable Time (NT10 threshold) for a question.
 * Heuristic: 0.2s per word + 5s base cognitive load.
 */
export function calculateMinViableTime(stem: string): number {
    const wordCount = stem.trim().split(/\s+/).length;
    // Base cognitive load (5s) + Reading time (0.2s/word)
    return Math.ceil(5 + (wordCount * 0.2));
}

/**
 * Confidence-Based Marking question
 */
export interface CBMQuestion extends BaseQuestion {
    type: 'CBM';
    options: Array<{
        id: string;
        text: string;
    }>;
}

/**
 * Ranking question (drag & drop ordering)
 */
export interface RankingQuestion extends BaseQuestion {
    type: 'RANKING';
    items: Array<{
        id: string;
        text: string;
    }>;
}

/**
 * Spotting question (error detection)
 */
export interface SpottingQuestion extends BaseQuestion {
    type: 'SPOTTING';
    text: string;
    interactiveSegments: Array<{
        id: string;
        startIndex: number;
        endIndex: number;
    }>;
}

/**
 * Union type for all question types
 */
export type Question = CBMQuestion | RankingQuestion | SpottingQuestion;

/**
 * Question state for navigation
 */
export type QuestionState = 'NOT_SEEN' | 'SEEN' | 'ANSWERED' | 'FLAGGED';

/**
 * Question metadata for the sidebar
 */
export interface QuestionMetadata {
    id: string;
    state: QuestionState;
    isFlagged: boolean;
}
