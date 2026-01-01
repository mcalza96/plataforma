import { type PartialKnowledgeMap } from '@/lib/domain/discovery';

/**
 * Pure functions to reduce and merge context updates from AI tool calls.
 */
export const ContextReducer = {
    /**
     * Merges a new update into the existing context.
     */
    merge(current: PartialKnowledgeMap, update: Partial<PartialKnowledgeMap>): PartialKnowledgeMap {
        const merged = { ...current };

        // 1. Scalar Fields
        if (update.subject) merged.subject = update.subject;
        if (update.targetAudience) merged.targetAudience = update.targetAudience;
        if (update.pedagogicalGoal) merged.pedagogicalGoal = update.pedagogicalGoal;
        if (update.studentProfile) merged.studentProfile = update.studentProfile;
        if (update.contentPreference) merged.contentPreference = update.contentPreference;
        if (update.examConfig) merged.examConfig = update.examConfig;

        // 2. Arrays (Cumulative & Deduplicated)

        // keyConcepts (Deduplicate strings)
        if (update.keyConcepts && update.keyConcepts.length > 0) {
            const existing = merged.keyConcepts || [];
            merged.keyConcepts = [...new Set([...existing, ...update.keyConcepts])];
        }

        // identifiedMisconceptions (Deduplicate by error string)
        if (update.identifiedMisconceptions && update.identifiedMisconceptions.length > 0) {
            const existing = merged.identifiedMisconceptions || [];
            const existingErrors = new Set(existing.map(m => m.error));
            const uniqueNew = update.identifiedMisconceptions.filter(m => !existingErrors.has(m.error));

            merged.identifiedMisconceptions = [...existing, ...uniqueNew];
        }

        return merged;
    }
};
