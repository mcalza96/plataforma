import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Header from '@/components/layout/header';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real production app, we would use a more robust role-based system
    // For this MVP, we use the ADMIN_EMAIL environment variable
    const adminEmail = process.env.ADMIN_EMAIL || 'mca@test.com';

    if (!user || user.email !== adminEmail) {
        console.warn(`Intento de acceso no autorizado a /admin por: ${user?.email}`);
        return redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white">
            {/* Admin Banner - Fixed at the very top */}
            <div className="admin-banner fixed top-0 left-0 right-0 z-[110] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.3em] py-1 text-center h-6">
                Modo Administrador - Procreate Alpha Studio
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Admin Sidebar - Fixed on Desktop */}
                <aside className="
                    fixed left-0 top-0 bottom-0 w-64 bg-surface/50 border-r border-white/5 
                    hidden lg:flex flex-col z-40 pt-admin-safe overflow-y-auto
                ">
                    <nav className="flex-1 p-4 space-y-2">
                        <Link
                            href="/admin/courses"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold group"
                        >
                            <span className="material-symbols-outlined text-amber-500 group-hover:scale-110 transition-transform">school</span>
                            Gestión de Cursos
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold group"
                        >
                            <span className="material-symbols-outlined text-amber-500 group-hover:scale-110 transition-transform">group</span>
                            Gestión de Familias
                        </Link>
                        <Link
                            href="/admin/submissions"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold group"
                        >
                            <span className="material-symbols-outlined text-amber-500 group-hover:scale-110 transition-transform">reviews</span>
                            Entregas y Feedback
                        </Link>
                        <Link
                            href="/admin/stats"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold group"
                        >
                            <span className="material-symbols-outlined text-amber-500 group-hover:scale-110 transition-transform">analytics</span>
                            Estadísticas Globales
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-xs text-gray-500 font-bold"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Dashboard
                        </Link>
                    </div>
                </aside>

                {/* Admin Content - Adjusted for fixed elements */}
                <main className="flex-1 lg:ml-64 pt-admin-safe min-h-screen bg-[#1A1A1A]">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
