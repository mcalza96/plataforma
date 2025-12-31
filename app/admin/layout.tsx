import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isAdmin, getAuthUser, getUserRole } from '@/lib/infrastructure/auth-utils';
import { getLearnerById } from '@/lib/data/courses';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, role] = await Promise.all([
        getAuthUser(),
        getUserRole()
    ]);

    if (!user || role !== 'admin') {
        console.warn(`Intento de acceso no autorizado a /admin`);
        return redirect('/dashboard');
    }

    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;
    const learner = learnerId ? await getLearnerById(learnerId) : null;

    return (
        <div className="h-screen bg-[#1A1A1A] text-white overflow-hidden">
            <AdminShell user={user} role={role} learner={learner}>
                {children}
            </AdminShell>
        </div>
    );
}
