'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeMap: Record<string, string> = {
    admin: 'Comando',
    courses: 'Misiones',
    submissions: 'Correcciones',
    users: 'Artistas',
    dashboard: 'Misión Control',
    gallery: 'Galería',
    'parent-dashboard': 'Padres',
    resources: 'Recursos',
    stats: 'Estadísticas',
    lessons: 'Lecciones',
};

export default function Breadcrumbs() {
    const pathname = usePathname();

    // Don't show breadcrumbs on landing page
    if (pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
            >
                <span className="material-symbols-outlined text-[14px]">home</span>
                Estudio
            </Link>

            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;
                const label = routeMap[segment] || (segment.length > 20 ? 'Detalle' : segment);

                return (
                    <div key={href} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px] opacity-30">chevron_right</span>
                        {isLast ? (
                            <span className="text-gray-300 truncate max-w-[150px]">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-white transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
