import { z } from 'zod';
export { type PartialKnowledgeMap } from './discovery';
import { PartialKnowledgeMapSchema, type PartialKnowledgeMap } from './discovery';

/**
 * ArchitectStage
 * Represents the sequential phases of the pedagogical knowledge engineering interview.
 */
export const ArchitectStageSchema = z.enum([
    'initial_profiling',     // Defining subject and target audience
    'content_definition',    // Deciding on content source (user vs AI) and suggestions
    'concept_extraction',    // Identifying key concepts/topics
    'shadow_work',           // Probing for misconceptions and hidden errors
    'exam_configuration',    // Defining number of questions and duration
    'synthesis',             // Final review and prototype generation
    'construction'           // Technical building and block refinement
]);

export type ArchitectStage = z.infer<typeof ArchitectStageSchema>;

/**
 * DiagnosticReadiness
 * Acts as a validation "traffic light" for the diagnostic generation process.
 */
export const DiagnosticReadinessSchema = z.object({
    hasTargetAudience: z.boolean().describe('Whether the target audience has been defined'),
    conceptCount: z.number().describe('Number of identified key concepts'),
    misconceptionCount: z.number().describe('Number of identified misconceptions'),
    isValid: z.boolean().describe('True only if business rules for generation are met')
});

export type DiagnosticReadiness = z.infer<typeof DiagnosticReadinessSchema>;

/**
 * ArchitectState
 * The global state object used for the TeacherOS Architect module.
 */
export const ArchitectStateSchema = z.object({
    stage: ArchitectStageSchema,
    context: PartialKnowledgeMapSchema,
    readiness: DiagnosticReadinessSchema,
    isGenerating: z.boolean().default(false),
    isCanvasReady: z.boolean().default(false),
    generatedProbeId: z.string().uuid().optional()
});

export type ArchitectState = z.infer<typeof ArchitectStateSchema>;

export const INITIAL_ARCHITECT_STATE: ArchitectState = {
    stage: 'initial_profiling',
    context: {
        subject: '',
        targetAudience: '',
        keyConcepts: [],
        identifiedMisconceptions: [],
        pedagogicalGoal: ''
    },
    readiness: {
        hasTargetAudience: false,
        conceptCount: 0,
        misconceptionCount: 0,
        isValid: false
    },
    isGenerating: false,
    isCanvasReady: false
};

/**
 * calculateReadiness
 * Pure helper function to determine if the current knowledge map is sufficient
 * to generate a valid diagnostic exam.
 * 
 * Rules:
 * - Minimum 3 concepts (conceptCount >= 3)
 * - Minimum 1 misconception (misconceptionCount >= 1) - CRITICAL
 * - Target audience must be defined (hasTargetAudience: true)
 * 
 * @param context The current partial knowledge map
 * @returns DiagnosticReadiness object
 */
export function calculateReadiness(context: PartialKnowledgeMap): DiagnosticReadiness {
    const hasTargetAudience = !!context.targetAudience && context.targetAudience.trim().length > 0;
    const conceptCount = context.keyConcepts?.length || 0;
    const misconceptionCount = context.identifiedMisconceptions?.length || 0;

    // Business Logic: 3+ concepts AND 1+ misconception AND has target audience
    const isValid = hasTargetAudience && conceptCount >= 3 && misconceptionCount >= 1;

    return {
        hasTargetAudience,
        conceptCount,
        misconceptionCount,
        isValid
    };
}

/**
 * getNextStage
 * Determines the next stage of the Architect FSM based on the current stage and updated context.
 */
export function getNextStage(currentStage: ArchitectStage, context: PartialKnowledgeMap): ArchitectStage {
    const hasSubjectAndTarget = context.subject && (context.targetAudience || context.studentProfile);
    let newStage = currentStage;

    if (hasSubjectAndTarget && currentStage === 'initial_profiling') {
        newStage = 'content_definition';
    }

    if (context.contentPreference && newStage === 'content_definition') {
        newStage = 'concept_extraction';
    }

    if ((context.keyConcepts || []).length >= 2 && newStage === 'concept_extraction') {
        newStage = 'shadow_work';
    }

    if ((context.identifiedMisconceptions || []).length >= 1 && newStage === 'shadow_work') {
        newStage = 'exam_configuration';
    }

    if (context.examConfig?.questionCount && newStage === 'exam_configuration') {
        newStage = 'synthesis';
    }

    return newStage;
}
