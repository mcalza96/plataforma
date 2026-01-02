'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { StudentDTO } from '@/lib/domain/course';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface AdminShellProps {
    children: React.ReactNode;
    user: User;
    role: 'admin' | 'instructor' | 'teacher';
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
        <div className="flex flex-col xl:flex-row h-screen bg-[#1A1A1A] overflow-hidden">
            {/* Sidebar with controlled state */}
            <AdminSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} role={role} />

            {/* Main Content Area - Fixed height to prevent overflow */}
            <div className="flex-1 xl:ml-64 flex flex-col h-screen relative bg-[#1A1A1A] overflow-hidden min-h-0">
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
