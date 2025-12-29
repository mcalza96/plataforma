'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getLessonService } from './di';
import { getUserRole, validateAdmin } from './infrastructure/auth-utils';
import { FeedbackSchema } from './validations';

/**
 * Obtiene las entregas filtradas para el administrador
 */
export async function getAdminSubmissions(filter: 'pending' | 'reviewed' = 'pending') {
    try {
        const role = await getUserRole();
        const service = getLessonService();
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
        const service = getLessonService();
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
        const service = getLessonService();

        await service.submitReview(validated, role);

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${validated.submissionId}`);
        revalidatePath('/dashboard');
        revalidatePath('/parent-dashboard');
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
        const service = getLessonService();
        return await service.getAvailableBadges();
    } catch (error: any) {
        console.error('Error in getAvailableBadges action:', error);
        return [];
    }
}

/**
 * Obtiene el historial de feedback de un alumno
 */
export async function getLearnerFeedback(learnerId: string) {
    try {
        const service = getLessonService();
        return await service.getLearnerFeedback(learnerId);
    } catch (error: any) {
        console.error('Error in getLearnerFeedback action:', error);
        return [];
    }
}

/**
 * Obtiene el historial de un alumno con conteo de no leídos
 */
export async function getUnreadFeedbackCount(learnerId: string) {
    try {
        const service = getLessonService();
        return await service.getUnreadFeedbackCount(learnerId);
    } catch (error: any) {
        console.error('Error in getUnreadFeedbackCount action:', error);
        return 0;
    }
}

/**
 * Marca un mensaje como leído por el alumno
 */
export async function markFeedbackAsRead(messageId: string) {
    try {
        const service = getLessonService();
        await service.markFeedbackAsRead(messageId);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error in markFeedbackAsRead action:', error);
        throw error;
    }
}

