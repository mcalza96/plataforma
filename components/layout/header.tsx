import Link from 'next/link';
import { getAuthUser, getUserRole } from '@/lib/infrastructure/auth-utils';
import { cookies } from 'next/headers';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import UserMenu from '@/components/layout/UserMenu';
import { getLearnerById } from '@/lib/data/courses';
import HeaderNav from './HeaderNav';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default async function Header() {
    const [user, role] = await Promise.all([
        getAuthUser(),
        getUserRole()
    ]);

    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    const learner = learnerId ? await getLearnerById(learnerId) : null;

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 group/header">
            <div className={`
                max-w-7xl mx-auto flex items-center justify-between border px-8 py-3 rounded-[2rem] transition-all duration-500
                bg-surface/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)]
                ${user ? 'border-white/5' : 'border-white/10'}
            `}>
                {/* Left: Logo & Breadcrumbs */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group/logo shrink-0">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(13,147,242,0.4)] group-hover/logo:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white font-black">brush</span>
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-white font-black tracking-tighter leading-none text-lg">ALPHA STUDIO</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Procreate Academy</span>
                        </div>
                    </Link>

                    <div className="hidden xl:block">
                        {role !== 'admin' && <Breadcrumbs />}
                    </div>
                </div>

                {/* Center: Contextual Navigation */}
                <HeaderNav hasUser={!!user} hasLearner={!!learnerId} isAdmin={role === 'admin'} />

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {learnerId && <NotificationCenter learnerId={learnerId} />}
                            <UserMenu user={user} learner={learner} role={role} />
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-black border border-white/10 transition-all active:scale-95 shadow-[0_5px_15px_rgba(13,147,242,0.3)]"
                        >
                            Empezar Ahora
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
