'use server';

import { revalidatePath } from 'next/cache';
import { getTeacherService, getStudentService, getAdminService } from '@/lib/infrastructure/di';
import { getAuthUser, getUserRole } from '@/lib/infrastructure/auth-utils';

/**
 * Obtiene todos los profesores (profiles) con sus estudiantes relacionados
 */
export async function getTeachers() {
    try {
        const role = await getUserRole();
        const service = getTeacherService();
        return await service.getTeachers(role);
    } catch (error: any) {
        console.error('Error fetching teachers:', error);
        throw new Error(error.message || 'No se pudieron obtener los profesores.');
    }
}

/**
 * Obtiene un profesor específico por ID con sus estudiantes
 */
export async function getTeacherById(id: string) {
    try {
        const role = await getUserRole();
        const service = getTeacherService();
        return await service.getTeacherById(id, role);
    } catch (error: any) {
        console.error('Error fetching teacher:', error);
        throw new Error(error.message || 'No se pudo encontrar el profesor solicitado.');
    }
}

/**
 * Actualiza el nivel de un estudiante
 */
export async function updateStudentLevel(studentId: string, profileId: string, newLevel: number) {
    try {
        const role = await getUserRole();
        const service = getStudentService();

        await service.updateStudentLevel(studentId, newLevel, role);

        revalidatePath(`/admin/users/${profileId}`);
        revalidatePath('/admin/users');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Error in updateStudentLevel:', error);
        return { success: false, error: error.message || 'Error al actualizar el nivel.' };
    }
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'instructor' | 'teacher') {
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


