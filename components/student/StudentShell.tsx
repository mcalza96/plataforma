'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { AppRole } from '@/lib/infrastructure/auth-utils';
import { StudentDTO } from '@/lib/domain/dtos/learner';
import StudentSidebar from './StudentSidebar';
import UserMenu from '@/components/layout/UserMenu';

interface StudentShellProps {
    children: React.ReactNode;
    user: User;
    role: AppRole;
    student: StudentDTO | null;
}

/**
 * StudentShell: Immersive workspace for students
 */
export default function StudentShell({ children, user, role, student }: StudentShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex flex-col xl:flex-row h-screen bg-background-dark overflow-hidden">
            {/* Sidebar with controlled state */}
            <StudentSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 xl:ml-64 flex flex-col h-screen relative bg-background-dark overflow-hidden min-h-0 will-change-transform">
                {/* Top Bar */}
                <header className="flex-shrink-0 h-20 border-b border-white/5 flex items-center justify-between px-6 bg-surface/30 backdrop-blur-md z-50">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="xl:hidden p-2 hover:bg-white/5 rounded-lg transition-colors active:scale-90"
                        aria-label="Menu"
                    >
                        <span className="material-symbols-outlined text-white text-2xl font-black">menu</span>
                    </button>

                    {/* Level Display / Gamification */}
                    <div className="hidden md:flex items-center gap-4">
                        {student && (
                            <div className="px-5 py-2 rounded-full bg-surface/50 border border-white/5 flex items-center gap-3 shadow-lg shadow-black/20">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante Nivel {student.level}</span>
                                <div className="w-24 h-1.5 bg-background-dark rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-2/3 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Info & Controls */}
                    <div className="flex items-center gap-4 ml-auto">
                        <UserMenu user={user} role={role} student={student} />
                    </div>
                </header>

                {/* Main Content with Independent Scroll */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col min-h-0 relative">
                    {/* Background Ambient Effect */}
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
                    <div className="relative z-10 w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
