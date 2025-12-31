'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

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

    const navLinks = [
        { href: '/admin/courses', label: 'Gestión de Cursos', icon: 'school' },
        { href: '/admin/exam-builder', label: 'Constructor', icon: 'rocket_launch' },
        { href: '/admin/exams', label: 'Gestión de Exámenes', icon: 'description' },
        { href: '/admin/users', label: 'Gestión de Familias', icon: 'group' },
        { href: '/admin/submissions', label: 'Entregas y Feedback', icon: 'reviews' },
        { href: '/admin/stats', label: 'Estadísticas Globales', icon: 'analytics' },
    ];

    return (
        <>
            {/* Backdrop for Mobile - High Z-index */}
            {isOpen && (
                <div
                    onClick={() => onOpenChange(false)}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] xl:hidden animate-in fade-in duration-300"
                />
            )}

            {/* Sidebar Container - Solid Background and explicit translation logic */}
            <aside className={`
                fixed top-0 bottom-0 left-0 w-64 bg-[#1A1A1A] border-r border-white/5 z-[160]
                flex flex-col shadow-2xl xl:shadow-none
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            `}>
                {/* Branding / Space */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[#1A1A1A]">
                    <div className="size-8 bg-amber-500 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-black text-xl font-bold">brush</span>
                    </div>
                    <span className="ml-3 font-black text-xs uppercase tracking-widest text-white xl:hidden">Menú Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-[#1A1A1A]">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold group
                                    ${isActive
                                        ? 'bg-amber-500/10 text-amber-500'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                `}
                            >
                                <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${isActive ? 'text-amber-500' : 'text-gray-500 group-hover:text-amber-500'}`}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-[#1A1A1A]">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs text-gray-500 font-bold group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Volver al Dashboard
                    </Link>
                </div>
            </aside>
        </>
    );
}
