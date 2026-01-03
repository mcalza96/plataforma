'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AppRole } from '@/lib/infrastructure/auth-utils';

interface AdminSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface NavItem {
    href: string;
    label: string;
    icon: string;
    isAdminOnly?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
    isAdminOnly?: boolean;
    isTeacherOnly?: boolean;
}

const MENU_GROUPS: NavGroup[] = [
    {
        title: 'GESTIÓN DE FLOTA',
        items: [
            { href: '/admin/stats', label: 'Monitor de Cohorte', icon: 'monitoring' },
            { href: '/admin/submissions', label: 'Sala de Corrección', icon: 'assignment_turned_in' },
            { href: '/admin/users', label: 'Gestión de Usuarios', icon: 'group' },
        ]
    },
    {
        title: 'AUDITORÍA DE SISTEMAS',
        items: [
            { href: '/admin/audit/items', label: 'Salud de Ítems', icon: 'health_metrics' },
            { href: '/admin/audit/graph', label: 'Mapa KST', icon: 'query_stats' },
            { href: '/admin/audit/fairness', label: 'Torre de Equidad', icon: 'balance' },
        ]
    }
];

export default function AdminSidebar({ isOpen, onOpenChange }: AdminSidebarProps) {
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
                fixed top-0 bottom-0 left-0 w-72 bg-surface/50 backdrop-blur-md border-r border-white/5 z-[160]
                flex flex-col shadow-2xl xl:shadow-none
                transition-transform duration-200 cubic-bezier(0.2, 1, 0.2, 1)
                ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            `}>
                {/* Branding / Space */}
                <div className="h-20 flex items-center px-8 border-b border-white/5 bg-surface/30">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center avatar-glow">
                        <span className="material-symbols-outlined text-white text-2xl font-black">terminal</span>
                    </div>
                    <div className="ml-4 flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">TeacherOS</span>
                        <span className="font-bold text-xs text-white">HUB TÁCTICO</span>
                    </div>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-8">
                    {MENU_GROUPS.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            prefetch={true}
                                            className={`
                                                flex items-center gap-4 px-4 min-h-[44px] rounded-2xl transition-all duration-200 cubic-bezier(0.2, 1, 0.2, 1) group relative overflow-hidden active:scale-[0.98]
                                                ${isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                            `}
                                        >
                                            <span className={`
                                                material-symbols-outlined transition-all duration-200
                                                ${isActive ? 'text-primary scale-110' : 'text-slate-600 group-hover:text-primary group-hover:scale-110'}
                                            `}>
                                                {item.icon}
                                            </span>
                                            <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                                                {item.label}
                                            </span>

                                            {/* Active Indicator Chip */}
                                            {isActive && (
                                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-surface/30">
                    <Link
                        href="/dashboard"
                        prefetch={true}
                        className="flex items-center gap-3 px-4 min-h-[44px] rounded-xl hover:bg-white/5 transition-colors text-xs text-slate-500 font-bold group"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        VOLVER AL DASHBOARD
                    </Link>
                </div>
            </aside>
        </>
    );
}
