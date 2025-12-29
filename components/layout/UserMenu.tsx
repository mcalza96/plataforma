'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/auth-actions';
import OptimizedImage from '@/components/ui/OptimizedImage';

import { LearnerDTO } from '@/lib/domain/course';

interface UserMenuProps {
    user: User;
    learner?: LearnerDTO | null;
    role: 'admin' | 'instructor' | 'user';
}

export default function UserMenu({ user, learner, role }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isAdmin = role === 'admin';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Avatar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 transition-all duration-300 click-shrink ${isOpen ? 'scale-105' : 'hover:scale-110'}`}
            >
                <div className={`relative size-10 rounded-full border-2 transition-all duration-300 ${isOpen ? 'border-primary ring-4 ring-primary/20' : 'border-primary/50'}`}>
                    {learner?.avatar_url ? (
                        <OptimizedImage
                            src={learner.avatar_url}
                            alt={learner.display_name}
                            fill
                            className="object-cover rounded-full"
                            containerClassName="w-full h-full rounded-full avatar-glow"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center rounded-full">
                            <span className="material-symbols-outlined text-gray-500">person</span>
                        </div>
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-[#1F1F1F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-white/[0.02] border-b border-white/5">
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-black text-sm truncate uppercase tracking-tight">
                                {learner ? learner.display_name : user.email?.split('@')[0]}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] truncate">
                                {user.email}
                            </span>
                        </div>
                        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                                {isAdmin ? 'Administrador' : 'Cuenta Familiar'}
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-3">
                        <Link
                            href="/select-profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">swap_horiz</span>
                            <span className="text-xs font-black uppercase tracking-widest">Cambiar de Artista</span>
                        </Link>

                        <Link
                            href="/parent-dashboard"
                            onClick={() => setIsOpen(false)}
                            className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                        >
                            <span className="material-symbols-outlined text-[20px] text-neon-violet group-hover:scale-110 transition-transform">family_restroom</span>
                            <span className="text-xs font-black uppercase tracking-widest">Zona de Padres</span>
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin/stats"
                                onClick={() => setIsOpen(false)}
                                className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                            >
                                <span className="material-symbols-outlined text-[20px] text-amber-500 group-hover:scale-110 transition-transform">admin_panel_settings</span>
                                <span className="text-xs font-black uppercase tracking-widest">Panel de Control</span>
                            </Link>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="p-3 border-t border-white/5 bg-red-500/[0.02]">
                        <button
                            onClick={() => signOut()}
                            className="w-full h-12 flex items-center gap-3 px-4 rounded-2xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all group"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">logout</span>
                            <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
