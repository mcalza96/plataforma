'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Selecciona un estudiante para la sesión actual e inicia su experiencia.
 */
export async function selectStudent(studentId: string) {
    const cookieStore = await cookies();

    // Guardamos el learner_id en una cookie segura de solo lectura en el servidor
    // Mantenemos el nombre de la cookie 'learner_id' por compatibilidad con RLS si fuera necesario, 
    // pero la función refleja la nueva nomenclatura.
    cookieStore.set('learner_id', studentId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return redirect('/dashboard');
}
