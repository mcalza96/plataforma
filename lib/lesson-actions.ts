'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export async function toggleStepCompletion(
    learnerId: string,
    lessonId: string,
    completedSteps: number,
    totalSteps: number,
    courseId: string
) {
    const supabase = await createClient();

    const isCompleted = completedSteps >= totalSteps;

    const { error } = await supabase
        .from('learner_progress')
        .upsert({
            learner_id: learnerId,
            lesson_id: lessonId,
            completed_steps: completedSteps,
            is_completed: isCompleted,
            last_watched_at: new Date().toISOString()
        }, {
            onConflict: 'learner_id,lesson_id'
        });

    if (error) {
        console.error('Error updating progress:', error);
        throw new Error(error.message);
    }

    revalidatePath(`/lessons/${courseId}`);
    revalidatePath('/dashboard');

    return { success: true };
}
