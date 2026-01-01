'use server';

import { revalidatePath } from 'next/cache';
import { getLessonService } from '@/lib/infrastructure/di';

/**
 * Alterna el estado de completado de un paso de una lección para un estudiante.
 */
export async function toggleStepCompletion(
    studentId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number,
    courseId: string
) {
    try {
        const service = getLessonService();
        await service.markStepComplete(studentId, lessonId, completedSteps, totalSteps);

        revalidatePath(`/lessons/${courseId}`);
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in toggleStepCompletion action:', error);
        return { success: false, error: error.message || 'Error al actualizar el progreso' };
    }
}
