'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
    label: string;
    href: string;
    isLast?: boolean;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
}

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
    phases: 'Fases'
};

/**
 * Breadcrumbs: Pure visual component for navigation wayfinding.
 * SRP: Responsibility is ONLY to render a list of breadcrumb items.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const pathname = usePathname();

    // Use items if provided, otherwise fallback to simple path resolution
    const resolvedItems: BreadcrumbItem[] = items || pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, array) => {
            const href = `/${array.slice(0, index + 1).join('/')}`;
            return {
                label: routeMap[segment] || segment,
                href,
                isLast: index === array.length - 1
            };
        });

    if (pathname === '/') return null;

    return (
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 overflow-x-auto no-scrollbar py-2">
            <Link
                href="/"
                className="hover:text-amber-500 transition-colors flex items-center gap-1 flex-shrink-0"
            >
                <span className="material-symbols-outlined text-[14px]">home</span>
                Estudio
            </Link>

            {resolvedItems.map((item) => (
                <div key={item.href} className="flex items-center gap-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-[12px] opacity-30">chevron_right</span>
                    {item.isLast ? (
                        <span className="text-white font-bold truncate max-w-[120px] sm:max-w-[200px]">
                            {item.label}
                        </span>
                    ) : (
                        <Link href={item.href} className="hover:text-gray-300 transition-colors">
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
