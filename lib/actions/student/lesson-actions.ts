'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { revalidatePath } from 'next/cache';

/**
 * Toggles step completion for a student in a lesson.
 * Updates the progress record in the database.
 */
export async function toggleStepCompletion(
    studentId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number,
    courseId: string
): Promise<void> {
    const supabase = await createClient();

    const isCompleted = completedSteps >= totalSteps;

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: studentId,
            lesson_id: lessonId,
            completed_steps: completedSteps,
            is_completed: isCompleted,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, lesson_id'
        });

    if (error) {
        console.error('Error toggling step completion:', error);
        throw new Error('Failed to update progress');
    }

    revalidatePath(`/lessons/${courseId}`);
    revalidatePath('/dashboard');
}
