import { redirect } from 'next/navigation';
import { getAuthUser, getUserRole } from '@/lib/infrastructure/auth-utils';
import { getStudentById } from '@/lib/data/learner';
import { cookies } from 'next/headers';
import StudentShell from '@/components/student/StudentShell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const [user, role] = await Promise.all([
        getAuthUser(),
        getUserRole()
    ]);

    if (!user) {
        return redirect('/login');
    }

    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    let student = null;
    if (studentId) {
        student = await getStudentById(studentId);
    } else if (role === 'admin') {
        // For admin development: try to get first available student or allow null
        const { createClient } = await import('@/lib/infrastructure/supabase/supabase-server');
        const supabase = await createClient();
        const { data: firstStudent } = await supabase
            .from('learners')
            .select('*')
            .limit(1)
            .single();

        if (firstStudent) {
            student = firstStudent;
            // Optionally set cookie for convenience
            cookieStore.set('learner_id', firstStudent.id);
        }
    }

    return (
        <StudentShell user={user} role={role} student={student}>
            {children}
        </StudentShell>
    );
}
