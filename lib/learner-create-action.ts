'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export async function createLearner(displayName: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No estás autenticado');

    // Reparación automática: Asegurar que el perfil existe
    // (Útil si el usuario se registró antes de activar el trigger)
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || 'Padre/Madre',
    });

    if (profileError) {
        console.error('Error ensuring profile existence for user:', user.id, profileError);
        throw new Error(`No se pudo crear tu perfil de padre (ID: ${user.id.substring(0, 8)}...): ${profileError.message}. Asegúrate de haber ejecutado el SQL para habilitar permisos en la tabla 'profiles'.`);
    }

    const { data, error } = await supabase
        .from('learners')
        .insert({
            parent_id: user.id,
            display_name: displayName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
            level: 1
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating learner:', error);
        throw new Error(error.message);
    }

    revalidatePath('/select-profile');
    return { success: true, learner: data };
}
