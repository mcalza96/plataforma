'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import UserMenu from '@/components/layout/UserMenu';
import { StudentDTO } from '@/lib/domain/course';

interface AdminTopBarProps {
    user: User;
    role: 'admin' | 'instructor' | 'teacher';
    student?: StudentDTO | null;
    onMenuClick?: () => void;
}

export default function AdminTopBar({ user, role, student, onMenuClick }: AdminTopBarProps) {
    return (
        <div className="h-16 flex items-center justify-between px-6 xl:px-8 bg-[#1A1A1A]/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
            {/* Left: Mobile Toggle & Context */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="xl:hidden size-10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                >
                    <span className="material-symbols-outlined text-2xl font-black">menu</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Puesto de Mando TeacherOS</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                    <span className="hidden sm:inline">Salir de Comando</span>
                </Link>

                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                    {student && <NotificationCenter studentId={student.id} />}
                    <UserMenu user={user} role={role} student={student} />
                </div>
            </div>
        </div>
    );
}
