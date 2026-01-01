'use server';

import { revalidatePath } from 'next/cache';
import { getLessonRepository } from '@/lib/infrastructure/di';

/**
 * Sends a general feedback message to a student from the admin panel.
 */
export async function sendFeedback(studentId: string, content: string) {
    const repository = getLessonRepository();

    try {
        await repository.submitReview({
            submissionId: '00000000-0000-0000-0000-000000000000', // Generic feedback
            studentId,
            content
        });

        revalidatePath('/dashboard');
        revalidatePath('/teacher-dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in sendFeedback action:', error);
        throw new Error(error.message || 'Error al enviar el feedback');
    }
}
