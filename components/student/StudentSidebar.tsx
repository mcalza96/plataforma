'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StudentSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const STUDENT_MENU_GROUPS: NavGroup[] = [
    {
        title: 'MI ESPACIO',
        items: [
            { href: '/student', label: 'Estudio', icon: 'palette' },
            { href: '/student/missions', label: 'Misiones', icon: 'rocket_launch' },
            { href: '/student/gallery', label: 'Galería', icon: 'gallery_thumbnail' },
        ]
    },
    {
        title: 'PROGRESO',
        items: [
            { href: '/student/achievements', label: 'Logros', icon: 'trophy' },
        ]
    }
];

export default function StudentSidebar({ isOpen, onOpenChange }: StudentSidebarProps) {
    const pathname = usePathname();

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop for Mobile - High Z-index */}
            {isOpen && (
                <div
                    onClick={() => onOpenChange(false)}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] xl:hidden animate-in fade-in duration-300"
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 bottom-0 left-0 w-72 bg-[#1A1A1A] border-r border-white/5 z-[160]
                flex flex-col shadow-2xl xl:shadow-none
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            `}>
                {/* Branding / Space */}
                <div className="h-20 flex items-center px-8 border-b border-white/5 bg-[#1A1A1A]">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(13,147,242,0.4)]">
                        <span className="material-symbols-outlined text-white text-2xl font-bold">brush</span>
                    </div>
                    <div className="ml-4 flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">Alpha Studio</span>
                        <span className="font-bold text-xs text-white">ACADEMIA</span>
                    </div>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-8">
                    {STUDENT_MENU_GROUPS.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-4 px-4 min-h-[44px] rounded-2xl transition-all group relative overflow-hidden
                                                ${isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                            `}
                                        >
                                            <span className={`
                                                material-symbols-outlined transition-all duration-300
                                                ${isActive ? 'text-primary scale-110' : 'text-gray-600 group-hover:text-primary group-hover:scale-110'}
                                            `}>
                                                {item.icon}
                                            </span>
                                            <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                                                {item.label}
                                            </span>

                                            {/* Active Indicator Chip */}
                                            {isActive && (
                                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(13,147,242,0.5)]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-[#1A1A1A]">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">rocket</span>
                            <span className="text-xs font-black text-white uppercase">Próxima Clase</span>
                        </div>
                        <p className="text-sm text-gray-400 font-bold leading-tight">Fundamentos de Luz y Sombra</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
