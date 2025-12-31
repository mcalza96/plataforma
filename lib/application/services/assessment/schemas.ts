import { z } from 'zod';

/**
 * Schema de validación para generación de probes
 */
export const ProbeGenerationSchema = z.object({
    type: z.enum(['multiple_choice_rationale', 'phenomenological_checklist']),
    stem: z.string(),
    options: z.array(z.object({
        content: z.string(),
        isCorrect: z.boolean(),
        feedback: z.string().optional(),
        diagnosesMisconceptionId: z.string().nullable().optional()
    })),
    observer_guide: z.string().describe(
        "A short, actionable tip for the parent/supervisor observing the student. It must be based on the provided 'Observable Symptom'. Explain what behavior to watch for (e.g., 'Watch if he counts with fingers', 'Notice if he writes without pausing to think about the common denominator')."
    )
});

export type ProbeGenerationResult = z.infer<typeof ProbeGenerationSchema>;
