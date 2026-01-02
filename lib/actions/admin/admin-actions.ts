'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { validateAdmin } from '@/lib/infrastructure/auth-utils';

/**
 * Sends a general feedback message to a student from the admin panel.
 */
export async function sendFeedback(studentId: string, content: string) {
    await validateAdmin();
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('reviews')
            .insert({
                submission_id: '00000000-0000-0000-0000-000000000000', // Generic feedback
                student_id: studentId,
                content
            });

        if (error) throw error;

        revalidatePath('/dashboard');
        revalidatePath('/teacher-dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in sendFeedback action:', error);
        throw new Error(error.message || 'Error al enviar el feedback');
    }
}
