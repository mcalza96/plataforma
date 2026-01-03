'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { AppRole } from '@/lib/infrastructure/auth-utils';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import UserMenu from '@/components/layout/UserMenu';

interface TeacherShellProps {
    children: React.ReactNode;
    user: User;
    role: AppRole;
}

/**
 * TeacherShell: Professional workspace shell for teachers
 * Split-panel architecture with persistent sidebar navigation
 */
export default function TeacherShell({ children, user, role }: TeacherShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex flex-col xl:flex-row h-screen bg-background-dark overflow-hidden">
            {/* Sidebar with controlled state - Updated to TeacherSidebar */}
            <TeacherSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

            {/* Main Content Area - Fixed height to prevent overflow */}
            <div className="flex-1 xl:ml-64 flex flex-col h-screen relative bg-background-dark overflow-hidden min-h-0">
                {/* Top Bar with Hamburger Menu */}
                <header className="flex-shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="xl:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Menu"
                    >
                        <span className="material-symbols-outlined text-white text-2xl">menu</span>
                    </button>

                    {/* User Info & Controls */}
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Autorizado</p>
                        </div>
                        <UserMenu user={user} role={role} />
                    </div>
                </header>

                {/* Main Content with Independent Scroll */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
