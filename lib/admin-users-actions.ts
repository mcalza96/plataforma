'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { validateAdmin } from './auth-utils';

/**
 * Obtiene todas las familias (profiles) con sus alumnos relacionados
 */
export async function getFamilies() {
    await validateAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            learners (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching families:', error);
        throw new Error('No se pudieron obtener las familias.');
    }

    return data;
}

/**
 * Obtiene una familia específica por ID con sus alumnos
 */
export async function getFamilyById(id: string) {
    await validateAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            learners (*)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching family:', error);
        throw new Error('No se pudo encontrar la familia solicitada.');
    }

    return data;
}

/**
 * Actualiza el nivel de un alumno (artista)
 */
export async function updateLearnerLevel(learnerId: string, profileId: string, newLevel: number) {
    try {
        await validateAdmin();

        if (newLevel < 1 || newLevel > 10) {
            throw new Error('El nivel debe estar entre 1 y 10.');
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('learners')
            .update({ level: newLevel })
            .eq('id', learnerId);

        if (error) throw error;

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
        await validateAdmin();

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Evitar que el admin se quite el rol a sí mismo
        if (user?.id === targetUserId && newRole !== 'admin') {
            throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId);

        if (error) throw error;

        revalidatePath(`/admin/users/${targetUserId}`);
        revalidatePath('/admin/users');

        return { success: true };
    } catch (error: any) {
        console.error('Error in updateUserRole:', error);
        return { success: false, error: error.message || 'Error al actualizar el rol.' };
    }
}
