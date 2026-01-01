'use server';
import { revalidatePath } from 'next/cache';
import { getStudentService } from '@/lib/infrastructure/di';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

export async function createStudent(displayName: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No estás autenticado');

    const service = getStudentService();

    // Reparación automática: Asegurar que el perfil existe
    await service.ensureProfileExists({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || 'Profesor',
    });

    const data = await service.createStudent({
        teacherId: user.id,
        displayName: displayName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
    });

    revalidatePath('/select-profile');
    return { success: true, student: data };
}

