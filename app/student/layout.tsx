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
        // Fallback si la cookie es inválida o el estudiante ya no existe
        if (!student) return redirect('/api/student/init');
    } else {
        // Redirigir al inicializador de sesión si no hay cookie
        return redirect('/api/student/init');
    }

    return (
        <StudentShell user={user} role={role} student={student}>
            {children}
        </StudentShell>
    );
}
