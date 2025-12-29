'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LearnerDTO } from '@/lib/domain/course';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

interface AdminShellProps {
    children: React.ReactNode;
    user: User;
    role: 'admin' | 'instructor' | 'user';
    learner?: LearnerDTO | null;
}

export default function AdminShell({ children, user, role, learner }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex flex-col xl:flex-row min-h-screen bg-[#1A1A1A]">
            {/* Sidebar with controlled state */}
            <AdminSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

            {/* Main Content Area - Padding only on XL when sidebar is fixed */}
            <div className="flex-1 xl:ml-64 flex flex-col min-h-screen relative bg-[#1A1A1A]">
                <AdminTopBar
                    user={user}
                    role={role}
                    learner={learner}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
