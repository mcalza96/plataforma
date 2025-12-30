'use server';

import { revalidatePath } from 'next/cache';
import { getFamilyService, getLearnerService, getAdminService } from './di';
import { getAuthUser, getUserRole } from './infrastructure/auth-utils';

/**
 * Obtiene todas las familias (profiles) con sus alumnos relacionados
 */
export async function getFamilies() {
    try {
        const role = await getUserRole();
        const service = getFamilyService();
        return await service.getFamilies(role);
    } catch (error: any) {
        console.error('Error fetching families:', error);
        throw new Error(error.message || 'No se pudieron obtener las familias.');
    }
}

/**
 * Obtiene una familia específica por ID con sus alumnos
 */
export async function getFamilyById(id: string) {
    try {
        const role = await getUserRole();
        const service = getFamilyService();
        return await service.getFamilyById(id, role);
    } catch (error: any) {
        console.error('Error fetching family:', error);
        throw new Error(error.message || 'No se pudo encontrar la familia solicitada.');
    }
}

/**
 * Actualiza el nivel de un alumno (artista)
 */
export async function updateLearnerLevel(learnerId: string, profileId: string, newLevel: number) {
    try {
        const role = await getUserRole();
        const service = getLearnerService();

        await service.updateLearnerLevel(learnerId, newLevel, role);

        revalidatePath(`/admin/users/${profileId}`);
        revalidatePath('/admin/users');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in updateLearnerLevel:', error);
        return { success: false, error: error.message || 'Error al actualizar el nivel.' };
    }
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'instructor' | 'user') {
    try {
        const role = await getUserRole();
        const user = await getAuthUser();
        const currentUserId = user?.id || '';

        const service = getAdminService();
        await service.updateUserRole(targetUserId, newRole, currentUserId, role);

        revalidatePath(`/admin/users/${targetUserId}`);
        revalidatePath('/admin/users');

        return { success: true };
    } catch (error: any) {
        console.error('Error in updateUserRole:', error);
        return { success: false, error: error.message || 'Error al actualizar el rol.' };
    }
}


