'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/config/navigation';

interface NavLinksProps {
    items: NavItem[];
}

export default function NavLinks({ items }: NavLinksProps) {
    const pathname = usePathname();

    return (
        <nav className="hidden lg:flex items-center gap-2">
            {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            relative px-5 h-11 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-xl
                            ${isActive
                                ? 'text-white bg-white/10 shadow-[0_4px_20px_rgba(255,255,255,0.05)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'opacity-50'}`}>
                            {item.icon}
                        </span>
                        {item.label}

                        {isActive && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#0d93f2]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
