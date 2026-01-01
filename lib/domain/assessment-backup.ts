import { z } from 'zod';
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

// --- Forensic Assessment System (White Box Diagnostics) ---

/**
 * Telemetry data captured during question interaction
 * Measures cognitive load and decision-making patterns
 */
export interface TelemetryData {
    /** Time spent on question in milliseconds */
    timeMs: number;
    /** Number of times the user changed their answer */
    hesitationCount: number;
    /** Number of times the window lost focus */
    focusLostCount: number;
    /** Confidence level (only for CBM questions) */
    confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Answer payload sent when user completes a question
 */
export interface AnswerPayload {
    /** Unique identifier of the question */
    questionId: string;
    /** Answer value (option ID, ordered array, segment ID, etc.) */
    value: any;
    /** True if user pressed "No sé" (knowledge gap) */
    isGap: boolean;
    /** Forensic telemetry data */
    telemetry: TelemetryData;
}

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

/**
 * Zod schema for answer validation
 */
export const AnswerPayloadSchema = z.object({
    questionId: z.string(),
    value: z.any(),
    isGap: z.boolean(),
    telemetry: z.object({
        timeMs: z.number(),
        hesitationCount: z.number(),
        focusLostCount: z.number(),
        confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    }),
});
