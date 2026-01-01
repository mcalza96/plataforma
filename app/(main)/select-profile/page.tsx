import { redirect } from 'next/navigation';
import ProfilesClient from './profiles-client';
import { getAuthUser } from '@/lib/infrastructure/auth-utils';
import { getLearnerService } from '@/lib/infrastructure/di';

export default async function SelectProfilePage() {
    const user = await getAuthUser();

    if (!user) {
        return redirect('/login');
    }

    const service = getLearnerService();
    const learners = await service.getLearnersByParentId(user.id);

    return (
        <main className="flex-grow flex flex-col justify-center py-12 px-6 relative">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-10">
                {/* Page Heading */}
                <div className="text-center space-y-3 mb-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-[-0.033em] text-white">
                        ¿Quién va a crear hoy?
                    </h2>
                    <p className="text-gray-400 text-lg font-normal">
                        Selecciona tu espacio de trabajo
                    </p>
                </div>

                {/* Split Card Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 md:gap-8 items-stretch">

                    {/* PARENT ZONE (Left) */}
                    <div className="group relative flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                        {/* Header Image Area */}
                        <div
                            className="relative h-48 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwz3sR0tbRvZuxH_-joJSkstYGwcDZvulkrocgGNwMyk3jrg1BfWu770RtTBRY3PonIZe0YT-kOe4VDUhWX4T3OhmrdbputkvcBrUAQiXwNeWhlPQfVbu2wX3diBKTiNKUz0ifwX3ZsWeSiFECkCln3l8Q4T3tOkuujdCoawxwwYfw8xCZO62qZNptGeqCt_xEhf1TsuF69yWdakgbqmNL9baIYb4nU4BKjkavKq80jda_9i9wq9Vce4WRBXD76vzBNujgNY9SIAQ')" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs text-gray-300">lock</span>
                                <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</span>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 p-8 flex flex-col items-start">
                            <div className="mb-4 bg-surface-hover p-3 rounded-xl inline-flex text-primary">
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Zona de Padres</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                                Gestiona suscripciones, revisa el progreso de las lecciones y configura los controles parentales.
                            </p>
                            <div className="mt-auto w-full">
                                <button className="w-full flex items-center justify-center gap-2 bg-surface-hover hover:bg-surface border border-white/10 text-white font-medium py-3 px-6 rounded-lg transition-all group-hover:bg-primary group-hover:border-primary group-hover:text-white">
                                    <span>Entrar</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                                    Requiere PIN de acceso
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* KIDS ZONE (Right) */}
                    <div className="flex flex-col bg-surface border border-white/5 rounded-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Artistas</h3>
                                <p className="text-gray-400 text-sm">Continúa tu aventura creativa</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-primary text-sm font-medium bg-primary/10 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-lg">school</span>
                                <span>3 Lecciones nuevas</span>
                            </div>
                        </div>

                        {/* Client Component for Avatar Grid and Selection Logic */}
                        <ProfilesClient learners={learners || []} />
                    </div>
                </div>
            </div>
        </main>
    );
}
