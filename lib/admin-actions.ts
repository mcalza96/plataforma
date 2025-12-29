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

export async function upsertCourse(courseData: any) {
    await checkAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('courses')
        .upsert({
            ...courseData,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error in upsertCourse:', error);
        throw new Error(error.message);
    }

    revalidatePath('/admin/courses');
    revalidatePath('/dashboard');
    return data;
}

export async function deleteCourse(courseId: string) {
    await checkAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) {
        console.error('Error in deleteCourse:', error);
        throw new Error(error.message);
    }

    revalidatePath('/admin/courses');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function upsertLesson(lessonData: any) {
    await checkAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lessons')
        .upsert({
            ...lessonData,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error in upsertLesson:', error);
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${lessonData.course_id}`);
    revalidatePath(`/lessons/${lessonData.course_id}`);
    return data;
}

export async function deleteLesson(lessonId: string, courseId: string) {
    await checkAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

    if (error) {
        console.error('Error in deleteLesson:', error);
        throw new Error(error.message);
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
}

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
