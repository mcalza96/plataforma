'use server';

import { revalidatePath } from 'next/cache';
import { getLessonService } from '@/lib/infrastructure/di';

export async function toggleStepCompletion(
    learnerId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number,
    courseId: string
) {
    try {
        const service = getLessonService();
        await service.markStepComplete(learnerId, lessonId, completedSteps, totalSteps);

        revalidatePath(`/lessons/${courseId}`);
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in toggleStepCompletion action:', error);
        return { success: false, error: error.message || 'Error updating progress' };
    }
}
