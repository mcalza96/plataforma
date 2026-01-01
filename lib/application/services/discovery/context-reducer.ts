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

        // 1. Subject-Based Invalidation (Pivot Protection)
        // If the subject changes significantly, we flush the collections to avoid "ghost memory"
        if (update.subject && current.subject && update.subject.toLowerCase() !== current.subject.toLowerCase()) {
            console.log(`[ContextReducer] Subject switch detected: "${current.subject}" -> "${update.subject}". Flushing context items.`);
            merged.keyConcepts = [];
            merged.identifiedMisconceptions = [];
            merged.conceptDifficulties = {};
            // We keep targetAudience and other session-level metadata, but clear pedagogical content
        }

        // 2. Scalar Fields
        if (update.subject) merged.subject = update.subject;
        if (update.targetAudience) merged.targetAudience = update.targetAudience;
        if (update.pedagogicalGoal) merged.pedagogicalGoal = update.pedagogicalGoal;
        if (update.studentProfile) merged.studentProfile = update.studentProfile;
        if (update.contentPreference) merged.contentPreference = update.contentPreference;
        if (update.examConfig) merged.examConfig = update.examConfig;

        // 2. Arrays (Cumulative & Deduplicated)

        // keyConcepts (Deduplicate strings)
        // Helper to normalize input which might be string[] or {name: string, difficultyStr}[]
        let newConcepts: string[] = [];
        let newDifficulties: Record<string, 'easy' | 'medium' | 'hard'> = {};

        if (update.keyConcepts && Array.isArray(update.keyConcepts)) {
            // @ts-ignore - Runtime check for mixed types from AI tool
            update.keyConcepts.forEach((c: any) => {
                if (typeof c === 'string') {
                    newConcepts.push(c);
                } else if (typeof c === 'object' && c.name) {
                    newConcepts.push(c.name);
                    if (c.difficulty) {
                        newDifficulties[c.name] = c.difficulty;
                    }
                }
            });

            const existing = merged.keyConcepts || [];
            merged.keyConcepts = [...new Set([...existing, ...newConcepts])];
        }

        // Merge difficulties
        // We cast 'update' to any to access conceptDifficulties if it was passed in the update object or extracted
        // But since we are extracting it locally from keyConcepts, we merge it directly
        if (Object.keys(newDifficulties).length > 0) {
            merged.conceptDifficulties = {
                ...(merged.conceptDifficulties || {}),
                ...newDifficulties
            };
        }

        // Also if update has conceptDifficulties directly (rare but possible)
        if ((update as any).conceptDifficulties) {
            merged.conceptDifficulties = {
                ...(merged.conceptDifficulties || {}),
                ...(update as any).conceptDifficulties
            };
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
