'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { StudentDTO } from '@/lib/domain/dtos/learner';
import { AppRole } from '@/lib/infrastructure/auth-utils';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface AdminShellProps {
    children: React.ReactNode;
    user: User;
    role: AppRole;
    student?: StudentDTO | null;
}

export default function AdminShell({ children, user, role, student }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex flex-col xl:flex-row h-screen bg-background-dark overflow-hidden">
            {/* Sidebar with controlled state */}
            <AdminSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

            {/* Main Content Area - Fixed height to prevent overflow */}
            <div className="flex-1 xl:ml-64 flex flex-col h-screen relative bg-background-dark overflow-hidden min-h-0 will-change-transform">
                <AdminTopBar
                    user={user}
                    role={role}
                    student={student}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
