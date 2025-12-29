'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Shared protection check
async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL || 'mca@test.com';

    if (!user || user.email !== adminEmail) {
        throw new Error('No autorizado');
    }
}

// --- Schemas ---

const FeedbackSchema = z.object({
    submissionId: z.string().uuid(),
    learnerId: z.string().uuid(),
    content: z.string().min(10, 'El feedback debe ser constructivo (min 10 caracteres)'),
    badgeId: z.string().uuid().optional().nullable(),
});

/**
 * Obtiene las entregas filtradas para el administrador
 */
export async function getAdminSubmissions(filter: 'pending' | 'reviewed' = 'pending') {
    await checkAdmin();
    const supabase = await createClient();

    const query = supabase
        .from('submissions')
        .select(`
            *,
            learners (
                id,
                display_name,
                avatar_url,
                level
            ),
            lessons (
                id,
                title
            )
        `)
        .order('created_at', { ascending: filter === 'pending' });

    if (filter === 'pending') {
        query.eq('is_reviewed', false);
    } else {
        query.eq('is_reviewed', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }

    return data;
}

/**
 * Obtiene el detalle de una entrega específica
 */
export async function getSubmissionDetail(id: string) {
    await checkAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('submissions')
        .select(`
            *,
            learners (
                *,
                profiles (email)
            ),
            lessons (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Envía feedback, otorga insignia y marca como revisada
 */
export async function submitReview(data: z.infer<typeof FeedbackSchema>) {
    try {
        await checkAdmin();
        const validated = FeedbackSchema.parse(data);
        const supabase = await createClient();

        // 1. Insert feedback message
        const { error: msgError } = await supabase
            .from('feedback_messages')
            .insert({
                learner_id: validated.learnerId,
                parent_id: (await supabase.from('learners').select('parent_id').eq('id', validated.learnerId).single()).data?.parent_id,
                sender_name: 'Instructor Procreate Studio',
                content: validated.content,
                is_read_by_learner: false
            });

        if (msgError) throw msgError;

        // 2. Award badge if selected
        if (validated.badgeId) {
            await supabase
                .from('learner_achievements')
                .upsert({
                    learner_id: validated.learnerId,
                    achievement_id: validated.badgeId
                }, { onConflict: 'learner_id,achievement_id' });
        }

        // 3. Mark submission as reviewed
        const { error: subError } = await supabase
            .from('submissions')
            .update({ is_reviewed: true })
            .eq('id', validated.submissionId);

        if (subError) throw subError;

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${validated.submissionId}`);
        revalidatePath('/dashboard');
        revalidatePath('/parent-dashboard');
        revalidatePath('/gallery');

        return { success: true };
    } catch (error: any) {
        console.error('Error in submitReview:', error);
        return { success: false, error: error.message || 'Error al enviar la revisión' };
    }
}

/**
 * Obtiene todas las insignias disponibles
 */
export async function getAvailableBadges() {
    const supabase = await createClient();
    const { data } = await supabase.from('achievements').select('*').order('level_required');
    return data || [];
}

/**
 * Obtiene el historial de feedback de un alumno
 */
export async function getLearnerFeedback(learnerId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('feedback_messages')
        .select('*')
        .eq('learner_id', learnerId)
        .order('created_at', { ascending: false });
    return data || [];
}

/**
 * Obtiene el historial de un alumno con conteo de no leídos
 */
export async function getUnreadFeedbackCount(learnerId: string) {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from('feedback_messages')
        .select('*', { count: 'exact', head: true })
        .eq('learner_id', learnerId)
        .eq('is_read_by_learner', false);

    if (error) return 0;
    return count || 0;
}

/**
 * Marca un mensaje como leído por el alumno
 */
export async function markFeedbackAsRead(messageId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('feedback_messages')
        .update({ is_read_by_learner: true })
        .eq('id', messageId);

    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true };
}
