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
        refutation: z.string()
    })).optional().describe('Common errors and their refutation strategies'),
    pedagogicalGoal: z.string().optional().describe('The primary objective of this knowledge unit')
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
