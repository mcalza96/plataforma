'use client';

import { usePathname } from 'next/navigation';
import NavLinks from './NavLinks';
import { marketingNav, learnerNav, adminNav } from '@/config/navigation';
import Link from 'next/link';

interface HeaderNavProps {
    hasUser: boolean;
    hasLearner: boolean;
    isAdmin: boolean;
}

export default function HeaderNav({ hasUser, hasLearner, isAdmin }: HeaderNavProps) {
    const pathname = usePathname();

    const isAdminRoute = pathname.startsWith('/admin');

    // Choose navigation set
    let navItems = marketingNav;
    if (isAdminRoute || (isAdmin && pathname.startsWith('/admin'))) {
        navItems = adminNav;
    } else if (hasUser && hasLearner) {
        navItems = learnerNav;
    }

    return (
        <div className="flex items-center gap-6">
            <NavLinks items={navItems} />

            {isAdminRoute && (
                <Link
                    href="/dashboard"
                    className="hidden lg:flex items-center gap-2 px-4 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                    Salir de Comando
                </Link>
            )}
        </div>
    );
}
