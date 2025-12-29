import { createClient } from './supabase-server';

export type AppRole = 'admin' | 'instructor' | 'user';

/**
 * Obtiene el rol del usuario actual desde la base de datos
 */
export async function getUserRole(): Promise<AppRole> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'user';

    // Fallback de "Super Admin" por email (Blindaje mientras se estabiliza la DB)
    const adminEmails = ['marcelo.calzadilla@jitdata.cl', 'admin@procreatealpha.studio'];
    if (user.email && adminEmails.includes(user.email)) {
        return 'admin';
    }

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
