/**
 * Assessment Result Entity
 * Represents the data submitted by a learner after a diagnostic probe.
 */
export class AssessmentResult {
    constructor(
        public readonly id: string,
        public readonly probeId: string,
        public readonly learnerId: string,
        public readonly selectedOptionId: string,
        public readonly timeSpentSeconds: number,
        public readonly attemptId?: string,
        public readonly createdAt?: Date
    ) { }
}

/**
 * Diagnostic Verdict Types
 */
export enum VerdictType {
    MASTERY = 'MASTERY',
    SPECIFIC_MISCONCEPTION = 'SPECIFIC_MISCONCEPTION',
    KNOWLEDGE_GAP = 'KNOWLEDGE_GAP'
}

/**
 * Diagnostic Verdict Value Object
 * The result of the triage analysis.
 */
export class DiagnosticVerdict {
    constructor(
        public readonly type: VerdictType,
        public readonly misconceptionId: string | null = null,
        public readonly confidence: number = 1.0
    ) {
        Object.freeze(this);
    }
}

/**
 * Path Mutation Actions
 */
export type MutationAction = 'INSERT_NODE' | 'UPDATE_STATUS' | 'UNLOCK_NEXT' | 'LOCK_DOWNSTREAM';

/**
 * Path Mutation Entity
 * Defines a structural change in the learner's learning path.
 */
export class PathMutation {
    constructor(
        public readonly action: MutationAction,
        public readonly targetNodeId: string,
        public readonly reason: string,
        public readonly metadata: {
            position?: 'BEFORE' | 'AFTER';
            newStatus?: 'locked' | 'available' | 'completed' | 'infected' | 'mastered';
            contentId?: string; // Content to insert
            title?: string; // Dynamic title for the new node
        } = {}
    ) { }
}
