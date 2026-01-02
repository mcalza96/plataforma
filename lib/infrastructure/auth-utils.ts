'use server';
import { createClient } from './supabase/supabase-server';

export type AppRole = 'admin' | 'instructor' | 'teacher' | 'user';

/**
 * Obtiene el usuario autenticado actual
 */
export async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Obtiene solo el ID del usuario actual
 */
export async function getUserId(): Promise<string | null> {
    const user = await getAuthUser();
    return user?.id || null;
}

/**
 * Obtiene el rol del usuario actual desde la base de datos
 */
export async function getUserRole(): Promise<AppRole> {
    const user = await getAuthUser();

    if (!user) return 'user';

    // Fallback de "Super Admin" por email (Blindaje mientras se estabiliza la DB)
    const adminEmails = ['marcelo.calzadilla@jitdata.cl', 'admin@procreatealpha.studio'];
    if (user.email && adminEmails.includes(user.email)) {
        return 'admin';
    }

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return (profile?.role as AppRole) || 'user';
}

/**
 * Verifica si el usuario actual es administrador
 */
export async function isAdmin(): Promise<boolean> {
    const role = await getUserRole();
    return role === 'admin';
}

/**
 * Verifica si el usuario actual es personal autorizado (admin, instructor, o teacher)
 */
export async function isStaff(): Promise<boolean> {
    const role = await getUserRole();
    return ['admin', 'instructor', 'teacher'].includes(role);
}

/**
 * Helper para proteger Server Actions (solo admin)
 */
export async function validateAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Acceso no autorizado. Se requieren permisos de administrador.');
    }
}

/**
 * Helper para proteger Server Actions (staff: admin, instructor, teacher)
 */
export async function validateStaff() {
    const staff = await isStaff();
    if (!staff) {
        throw new Error('Acceso no autorizado. Se requieren permisos de personal autorizado.');
    }
}

/**
 * Valida que el usuario sea el dueño del recurso o administrador
 * @param resourceCreatorId - ID del creador del recurso
 */
export async function validateOwnership(resourceCreatorId: string) {
    const user = await getAuthUser();
    const admin = await isAdmin();

    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Admins bypass ownership
    if (admin) return;

    // Check ownership
    if (user.id !== resourceCreatorId) {
        throw new Error('No tienes permiso para modificar este recurso porque no eres el creador.');
    }
}
