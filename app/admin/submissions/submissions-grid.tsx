'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Submission } from '@/lib/domain/dtos/learner';

export default function SubmissionsGrid({ submissions, tab }: { submissions: Submission[], tab: string }) {
    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-700">
                        {tab === 'pending' ? 'auto_awesome' : 'history'}
                    </span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                        {tab === 'pending' ? '¡Todo al día, Profesor!' : 'No hay historial de revisiones'}
                    </h3>
                    <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        {tab === 'pending'
                            ? 'No hay entregas pendientes de revisión ahora mismo. ¡Tómate un respiro artístico!'
                            : 'Aún no has revisado ninguna obra. ¡La sala de corrección te espera!'}
                    </p>
                </div>
                {tab === 'reviewed' && (
                    <Link href="/admin/submissions?tab=pending" className="bg-amber-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95">
                        Ver Pendientes
                    </Link>
                )}
            </div>
        );
    }

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Ahora mismo';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map((sub, index) => (
                <Link
                    key={sub.id}
                    href={`/admin/submissions/${sub.id}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="group relative bg-[#1F1F1F] border border-white/5 rounded-[2rem] overflow-hidden hover:border-amber-500/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                >
                    {/* Media Preview */}
                    <div className="aspect-video relative bg-black overflow-hidden">
                        <div className="absolute inset-0 bg-neutral-900 group-hover:scale-110 transition-transform duration-1000">
                            {/* Thumbnail Placeholder logic preserved, assuming sub.thumbnail_url exists in DB result */}
                            {(sub as any).thumbnail_url ? (
                                <OptimizedImage
                                    src={(sub as any).thumbnail_url}
                                    alt={sub.title}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                    <span className="material-symbols-outlined text-4xl">movie</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-transparent to-transparent opacity-60" />

                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-[0.1em] border border-white/10 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px] text-amber-500">history_edu</span>
                                {sub.lesson?.title || 'Estudio Independiente'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-11 rounded-2xl border border-white/10 overflow-hidden relative shadow-lg avatar-glow bg-neutral-900">
                                <OptimizedImage
                                    src={sub.student?.avatar_url || ''}
                                    alt={sub.student?.display_name || 'Estudiante'}
                                    fill
                                    className="object-cover"
                                    fallbackIcon="person"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate group-hover:text-amber-500 transition-colors uppercase italic">
                                    {sub.student?.display_name}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                    Nivel {sub.student?.level || 1}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-white leading-tight line-clamp-1 mb-6 uppercase tracking-tighter italic">
                            {sub.title}
                        </h3>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <span className={`material-symbols-outlined text-[14px] ${tab === 'pending' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {tab === 'pending' ? 'schedule' : 'verified'}
                                </span>
                                {timeAgo(sub.created_at)}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                                {tab === 'pending' ? 'CORREGIR' : 'DETALLE'}
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
