import { AtomicLearningObject } from '../../../domain/schemas/alo';
import { z } from 'zod';
import { DiagnosisSchema } from '@/lib/domain/assessment';

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

/**
 * Propuesta de planificación de aprendizaje
 */
export interface PlanningProposal {
    suggested_title: string;
    rationale: string;
    modules: {
        content_id: string;
        order: number;
        reason: string;
    }[];
}

/**
 * Pregunta de quiz
 */
export interface QuizQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}
