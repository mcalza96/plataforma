import { redirect } from 'next/navigation';
import { getUserId, validateStaff, getUserRole } from '@/lib/infrastructure/auth-utils';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import TeacherShell from '@/components/teacher/TeacherShell';

/**
 * TeacherLayout: Wraps all teacher routes with professional shell
 */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
    // Validate staff access
    await validateStaff();

    const teacherId = await getUserId();
    if (!teacherId) {
        return redirect('/login');
    }

    // Get user and role for shell
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const role = await getUserRole();

    return <TeacherShell user={user} role={role}>{children}</TeacherShell>;
}
