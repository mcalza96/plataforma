import { getFamilies } from '@/lib/admin-users-actions';
import Link from 'next/link';
import Image from 'next/image';

export default async function AdminUsersPage() {
    const families = await getFamilies();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm shadow-2xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Gestión de Comunidad</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Familias Registradas</h1>
                    <p className="text-gray-400 text-sm max-w-md">Supervisa las cuentas de padres y el progreso de los pequeños artistas.</p>
                </div>

                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Padres</p>
                        <p className="text-xl font-black text-amber-500">{families.length}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Alumnos</p>
                        <p className="text-xl font-black text-amber-500">
                            {families.reduce((acc, f) => acc + (f.learners?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* List/Grid */}
            {families.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]">
                    <span className="material-symbols-outlined text-6xl text-gray-700">group_off</span>
                    <h3 className="text-xl font-bold text-gray-500">No hay familias registradas aún</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {families.map((family) => (
                        <Link
                            key={family.id}
                            href={`/admin/users/${family.id}`}
                            className="group bg-surface/40 border border-white/5 rounded-[2rem] p-6 hover:border-amber-500/50 hover:bg-surface/60 transition-all duration-500 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-12 rounded-2xl bg-neutral-800 flex items-center justify-center border border-white/10 overflow-hidden relative shadow-inner">
                                    <span className="material-symbols-outlined text-gray-600">person</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold truncate group-hover:text-amber-500 transition-colors">
                                        {family.email}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                        Registrado: {new Date(family.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">school</span>
                                    <span className="text-xs font-bold text-gray-400">
                                        {family.learners?.length || 0} {family.learners?.length === 1 ? 'Alumno' : 'Alumnos'}
                                    </span>
                                </div>
                                <span className="material-symbols-outlined text-gray-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
