'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function selectLearner(learnerId: string) {
    const cookieStore = await cookies();

    // Guardamos el learner_id en una cookie segura de solo lectura en el servidor
    cookieStore.set('learner_id', learnerId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return redirect('/dashboard'); // Redirigir al dashboard del niño
}
