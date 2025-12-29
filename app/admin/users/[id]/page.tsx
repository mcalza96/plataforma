import { getFamilyById } from '@/lib/admin-users-actions';
import Link from 'next/link';
import LearnerLevelControl from './level-control';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function FamilyDetailPage({ params }: PageProps) {
    const { id } = await params;
    const family = await getFamilyById(id);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users" className="size-10 flex items-center justify-center bg-surface/50 border border-white/5 rounded-xl hover:bg-white/5 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                </Link>
                <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Detalle de Familia</p>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-none italic uppercase">
                        {family.email}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Family Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface/30 border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-sm">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Información del Padre</label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-500/50">mail</span>
                                    <span className="text-sm text-gray-300">{family.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-500/50">calendar_month</span>
                                    <span className="text-sm text-gray-300">Unido el {new Date(family.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-500/50">fingerprint</span>
                                    <span className="text-[10px] text-gray-600 font-mono truncate">{family.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Estado de Cuenta</p>
                                <p className="text-white text-sm font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    Activa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Artists Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                            Artistas de la Familia <span className="text-gray-700 ml-2">({family.learners?.length || 0})</span>
                        </h2>
                    </div>

                    {!family.learners || family.learners.length === 0 ? (
                        <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem]">
                            <p className="text-gray-500 font-medium italic">Esta familia aún no ha creado perfiles de artistas.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {family.learners.map((learner: any) => (
                                <LearnerLevelControl
                                    key={learner.id}
                                    learner={learner}
                                    profileId={family.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
