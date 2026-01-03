import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    // Attempt to auto-select the first learner associated with the user
    let { data: learners } = await supabase
        .from('learners')
        .select('id')
        .eq('parent_id', user.id)
        .limit(1);

    // Admin Fallback: If no learners for this parent but user is admin, get any learner
    if ((!learners || learners.length === 0)) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'admin') {
            const { data: anyLearners } = await supabase
                .from('learners')
                .select('id')
                .limit(1);
            learners = anyLearners;
        }
    }

    if (learners && learners.length > 0) {
        const cookieStore = await cookies();
        cookieStore.set('learner_id', learners[0].id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        // Redirect back to student dashboard only if we set the cookie
        return redirect('/student');
    }

    // If no learner found even after fallback, show informative error or redirect to help
    return new Response('No se encontró un perfil de estudiante asociado. Contacte a soporte.', { status: 404 });
}
