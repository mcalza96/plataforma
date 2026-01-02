'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { revalidatePath } from 'next/cache';

/**
 * Assigns an existing student to a teacher.
 * Only Admins can execute strict assignment permissions if needed, 
 * but RLS currently allows admins to manage all.
 */
export async function assignStudentToTeacher(studentId: string, teacherId: string) {
    const supabase = await createClient();

    // Verificación de permisos (opcional si RLS ya lo cubre, pero bueno para UX)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado');

    // Insertar en tabla de mapeo
    const { error } = await supabase
        .from('teacher_student_mapping')
        .insert({
            student_id: studentId,
            teacher_id: teacherId
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { success: false, message: 'El estudiante ya está asignado a este profesor.' };
        }
        console.error('Error assigning student:', error);
        throw new Error('Error al asignar estudiante.');
    }

    revalidatePath('/admin/users'); // O la ruta donde se gestione esto
    return { success: true };
}
