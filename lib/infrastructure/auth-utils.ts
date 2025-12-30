'use server';
import { createClient } from './supabase/supabase-server';

export type AppRole = 'admin' | 'instructor' | 'user';

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
 * Helper para proteger Server Actions
 */
export async function validateAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error('Acceso no autorizado. Se requieren permisos de administrador.');
    }
}
