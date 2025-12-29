'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

import { validateAdmin } from './auth-utils';

export async function sendFeedback(learnerId: string, content: string) {
    await validateAdmin();
    const supabase = await createClient();

    // Get learner to find parent_id
    const { data: learner } = await supabase
        .from('learners')
        .select('parent_id')
        .eq('id', learnerId)
        .single();

    if (!learner) throw new Error('Alumno no encontrado');

    const { data, error } = await supabase
        .from('feedback_messages')
        .insert({
            learner_id: learnerId,
            parent_id: learner.parent_id,
            sender_name: 'Instructor Procreate Studio',
            content
        })
        .select()
        .single();

    if (error) {
        console.error('Error in sendFeedback:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/parent-dashboard');
    return data;
}
