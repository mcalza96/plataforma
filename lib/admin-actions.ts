'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

// Protection check repeated here for security
async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL || 'mca@test.com';
    if (!user || user.email !== adminEmail) {
        throw new Error('No autorizado');
    }
}

// Migrated to lib/admin-content-actions.ts
// upsertCourse, deleteCourse, upsertLesson, deleteLesson have been removed from here.

export async function sendFeedback(learnerId: string, content: string) {
    await checkAdmin();
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
