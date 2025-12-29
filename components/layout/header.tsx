import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export default async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between bg-surface/80 backdrop-blur-xl border border-white/5 px-8 py-3 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(13,147,242,0.4)] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white font-black">brush</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-tighter leading-none text-lg">ALPHA STUDIO</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Procreate Academy</span>
                    </div>
                </Link>

                {/* Navigation - Hidden on mobile, visible on desktop */}
                <nav className="hidden lg:flex items-center gap-9">
                    <Link className="text-gray-300 text-sm font-medium leading-normal hover:text-primary transition-colors" href="/dashboard">Misión Control</Link>
                    <Link className="text-[#90b2cb] text-sm font-medium leading-normal hover:text-white transition-colors" href="/gallery">Galería</Link>
                    <Link className="text-[#90b2cb] text-sm font-medium leading-normal hover:text-white transition-colors" href="/parent-dashboard">Zona Padres</Link>
                    <Link className="text-[#90b2cb] text-sm font-medium leading-normal hover:text-white transition-colors" href="/resources">Recursos</Link>
                </nav>

                {/* Right: CTA/Profile */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:block text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">
                                {user.email?.split('@')[0]}
                            </span>
                            <Link href="/select-profile" className="size-10 rounded-full border-2 border-primary overflow-hidden hover:scale-110 transition-transform bg-neutral-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">person</span>
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-black border border-white/10 transition-all active:scale-95 shadow-[0_5px_15px_rgba(13,147,242,0.3)]"
                        >
                            Empezar Ahora
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
