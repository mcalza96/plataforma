import { z } from 'zod';

/**
 * Partial Knowledge Map schema
 * This represents the metadata that the AI is extracting during the interview.
 */
export const PartialKnowledgeMapSchema = z.object({
    subject: z.string().optional().describe('Main subject of the lesson'),
    targetAudience: z.string().optional().describe('Description of the intended student'),
    keyConcepts: z.array(z.string()).optional().describe('Fundamental concepts identified'),
    identifiedMisconceptions: z.array(z.object({
        error: z.string(),
        refutation: z.string(),
        distractor_artifact: z.string().optional(),
        observable_symptom: z.string().optional(),
        competencyId: z.string().optional().describe('Link to the keyConcept it belongs to')
    })).optional().describe('Common errors with their refutation strategies, literal artifacts, and observable symptoms'),
    prerequisites: z.array(z.object({
        from: z.string(),
        to: z.string()
    })).optional().describe('Directed links representing prerequisite relationships between concepts'),
    pedagogicalGoal: z.string().optional().describe('The primary objective of this knowledge unit'),
    studentProfile: z.string().optional().describe('Specific details about the learners (e.g., engineering students)'),
    contentPreference: z.enum(['user_provided', 'ai_suggested', 'mixed']).optional().describe('How the content is defined'),
    examConfig: z.object({
        questionCount: z.number().optional(),
        durationMinutes: z.number().optional()
    }).optional().describe('User preferences for the exam structure'),
    conceptDifficulties: z.record(z.string(), z.enum(['easy', 'medium', 'hard'])).optional().describe('Map of concept names to difficulty tiers'),
    prototypes: z.array(z.object({
        id: z.string(),
        stem: z.string(),
        options: z.array(z.object({
            content: z.string(),
            isCorrect: z.boolean(),
            rationale: z.string().describe('Why this option exists (pedagogical reason)')
        })),
        pedagogicalReasoning: z.string().describe('Why this question was chosen/designed this way'),
        alternatives: z.array(z.string()).optional().describe('Other ways to ask this')
    })).optional().describe('Draft questions for user review')
}).passthrough();

export type PartialKnowledgeMap = z.infer<typeof PartialKnowledgeMapSchema>;

/**
 * Discovery status
 */
export type DiscoveryStatus = 'idle' | 'interviewing' | 'analyzing' | 'completed';

/**
 * Context of the discovery session
 */
export interface DiscoveryContext extends PartialKnowledgeMap {
    lessonId?: string;
}

/**
 * Discovery state encapsulating the conversation and the extracted context
 */
export interface DiscoveryState {
    status: DiscoveryStatus;
    context: DiscoveryContext;
}
