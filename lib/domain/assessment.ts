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
