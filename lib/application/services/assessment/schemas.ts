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
        diagnosesMisconceptionId: z.string().nullable().optional().describe("Mandatory for 'trap' options. Must match an ID from the provided 'Identified Misconceptions' list.")
    })),
    observer_guide: z.string().describe(
        "A short, actionable tip for the parent/supervisor observing the student. It must be based on the provided 'Observable Symptom'. Explain what behavior to watch for (e.g., 'Watch if he counts with fingers', 'Notice if he writes without pausing to think about the common denominator')."
    )
});

export type ProbeGenerationResult = z.infer<typeof ProbeGenerationSchema>;

/**
 * Schema para generación de prototipos (múltiples ejemplos)
 */
export const PrototypeSchema = z.object({
    prototypes: z.array(z.object({
        id: z.string().describe("UUID o ID corto único para el prototipo"),
        type: z.enum(['CBM', 'RANKING', 'SPOTTING']).describe("El tipo técnico de la pregunta. Por defecto usa 'CBM' para preguntas de selección múltiple."),
        stem: z.string().describe("El enunciado de la pregunta"),
        options: z.array(z.object({
            content: z.string(),
            isCorrect: z.boolean(),
            rationale: z.string().describe("Por qué esta opción es válida o por qué es un distractor efectivo")
        })),
        pedagogicalReasoning: z.string().describe("Descripción breve de por qué elegimos esta pregunta y su enfoque"),
        alternatives: z.array(z.string()).optional().describe("Formas alternativas de preguntar lo mismo")
    }))
});

export type PrototypeGenerationResult = z.infer<typeof PrototypeSchema>;
