import { z } from 'zod';
import { Lesson } from '@/lib/domain/entities/course';

import { StepData } from '@/components/admin/StepCard';

// --- Base Schemas ---

const StepBaseSchema = z.object({
    id: z.string(),
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().optional(),
    duration: z.number().min(1, "La duración mínima es 1 minuto"),
});

// --- Specialized Schemas ---

const VideoBlockSchema = StepBaseSchema.extend({
    type: z.literal('video'),
    // We might validate description contains a URL if we store it there, 
    // but for now relying on logic used in ContextPanel or generic description
});

const QuizOptionSchema = z.object({
    id: z.string(),
    content: z.string().min(1, "La opción no puede estar vacía"),
    isCorrect: z.boolean(),
    diagnosesMisconceptionId: z.string().uuid().nullable().optional(),
    feedback: z.string().optional()
});

const QuizBlockSchema = StepBaseSchema.extend({
    type: z.literal('quiz'),
    metadata: z.object({
        isDiagnostic: z.boolean().optional(),
        linkedProbeId: z.string().uuid().optional(),
        misconceptionIds: z.array(z.string()).optional()
    }).optional(),
    quizData: z.object({
        stem: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
        options: z.array(QuizOptionSchema).min(2, "Se requieren al menos 2 opciones")
    }).optional()
}).refine(data => {
    // Zero-Gap Rule: If diagnostic, at least one distractor must have a misconception ID
    if (data.metadata?.isDiagnostic) {
        if (!data.quizData) return false;
        const hasDiagonal = data.quizData.options.some(opt => !opt.isCorrect && !!opt.diagnosesMisconceptionId);
        return hasDiagonal;
    }
    return true;
}, {
    message: "Un bloque de diagnóstico debe vincular al menos un distractor a un malentendido (Mapeo Q)",
    path: ["quizData"]
});

const PracticeBlockSchema = StepBaseSchema.extend({
    type: z.literal('practice'),
    description: z.string().min(20, "Las instrucciones de práctica deben ser detalladas (mín. 20 caracteres)"),
});

const ResourceBlockSchema = StepBaseSchema.extend({
    type: z.literal('resource'),
    description: z.string().url("Debe ser una URL válida al recurso"),
});

// Discriminated Union
export const StepSchema = z.discriminatedUnion('type', [
    VideoBlockSchema,
    QuizBlockSchema,
    PracticeBlockSchema,
    ResourceBlockSchema
]);

// --- Lesson Context Schema ---
export const PhaseContextSchema = z.object({
    title: z.string().min(5, "El título de la fase es muy corto (mín. 5 caracteres)"),
    video_url: z.string().url("Necesitamos una URL de video (MP4/Loom) válida"),
});

// ... Validation Functions ...

export function validateStep(step: StepData): string[] {
    const result = StepSchema.safeParse(step);
    if (!result.success) {
        return result.error.issues.map((e: z.ZodIssue) => e.message);
    }
    return [];
}

export function validatePhase(lesson: Lesson, steps: StepData[]): {
    contextErrors: string[];
    stepErrors: Record<string, string[]>;
    isValid: boolean;
} {
    // 1. Validate Context Metadata
    const contextResult = PhaseContextSchema.safeParse(lesson);
    const contextErrors = contextResult.success
        ? []
        : contextResult.error.issues.map((e: z.ZodIssue) => e.message);

    // 2. Validate Step Count (Business Rule: Min 1)
    if (steps.length === 0) {
        contextErrors.push("Mínimo 1 paso LEGO para completar el despliegue");
    }

    // 3. Validate Individual Steps
    const stepErrors: Record<string, string[]> = {};
    let hasStepErrors = false;

    steps.forEach(step => {
        const errors = validateStep(step);
        if (errors.length > 0) {
            stepErrors[step.id] = errors;
            hasStepErrors = true;
        }
    });

    return {
        contextErrors,
        stepErrors,
        isValid: contextErrors.length === 0 && !hasStepErrors
    };
}
