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
    }))
});

export type ProbeGenerationResult = z.infer<typeof ProbeGenerationSchema>;
