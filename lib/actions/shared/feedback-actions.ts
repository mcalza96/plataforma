'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSubmissionService, getFeedbackService } from '@/lib/infrastructure/di';
import { getUserRole } from '@/lib/infrastructure/auth-utils';
import { FeedbackSchema } from '@/lib/domain/schemas/course';

/**
 * Obtiene las entregas filtradas para el administrador o profesor
 */
export async function getAdminSubmissions(filter: 'pending' | 'reviewed' = 'pending') {
    try {
        const role = await getUserRole();
        const service = getSubmissionService();
        return await service.getAdminSubmissions(filter, role);
    } catch (error: any) {
        console.error('Error in getAdminSubmissions action:', error);
        return [];
    }
}

/**
 * Obtiene el detalle de una entrega específica
 */
export async function getSubmissionDetail(id: string) {
    try {
        const role = await getUserRole();
        const service = getSubmissionService();
        return await service.getSubmissionDetail(id, role);
    } catch (error: any) {
        console.error('Error in getSubmissionDetail action:', error);
        throw error;
    }
}

/**
 * Envía feedback, otorga insignia y marca como revisada
 */
export async function submitReview(data: z.infer<typeof FeedbackSchema>) {
    try {
        const validated = FeedbackSchema.parse(data);
        const role = await getUserRole();
        const service = getSubmissionService();

        await service.submitReview({
            submissionId: validated.submissionId,
            studentId: validated.studentId, // Se mapea por compatibilidad con el schema actual
            content: validated.content,
            badgeId: validated.badgeId
        }, role);

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${validated.submissionId}`);
        revalidatePath('/dashboard');
        revalidatePath('/teacher-dashboard');
        revalidatePath('/gallery');

        return { success: true };
    } catch (error: any) {
        console.error('Error in submitReview action:', error);
        return { success: false, error: error.message || 'Error al enviar la revisión' };
    }
}

/**
 * Obtiene todas las insignias disponibles
 */
export async function getAvailableBadges() {
    try {
        const service = getSubmissionService();
        return await service.getAvailableBadges();
    } catch (error: any) {
        console.error('Error in getAvailableBadges action:', error);
        return [];
    }
}

/**
 * Obtiene el historial de feedback de un estudiante
 */
export async function getStudentFeedback(studentId: string) {
    try {
        const service = getFeedbackService();
        return await service.getStudentFeedback(studentId);
    } catch (error: any) {
        console.error('Error in getStudentFeedback action:', error);
        return [];
    }
}

/**
 * Obtiene el historial de un estudiante con conteo de no leídos
 */
export async function getUnreadFeedbackCount(studentId: string) {
    try {
        const service = getFeedbackService();
        return await service.getUnreadFeedbackCount(studentId);
    } catch (error: any) {
        console.error('Error in getUnreadFeedbackCount action:', error);
        return 0;
    }
}

/**
 * Marca un mensaje como leído por el estudiante
 */
export async function markFeedbackAsRead(messageId: string) {
    try {
        const service = getFeedbackService();
        await service.markFeedbackAsRead(messageId);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error in markFeedbackAsRead action:', error);
        throw error;
    }
}
