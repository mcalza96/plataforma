import { getAdminSubmissions } from '@/lib/actions/shared/feedback-actions';
import SubmissionsGrid from './submissions-grid';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ tab?: 'pending' | 'reviewed' }>;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
    const { tab = 'pending' } = await searchParams;
    const submissions = await getAdminSubmissions(tab);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Sala de Corrección</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Galería de Talento</h1>
                    <p className="text-gray-400 text-sm max-w-md">Transforma el esfuerzo de tus alumnos en arte profesional a través del feedback constructivo.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <Link
                        href="/admin/submissions?tab=pending"
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${tab === 'pending'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        PENDIENTES
                        {tab === 'pending' && submissions.length > 0 && (
                            <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-[9px]">{submissions.length}</span>
                        )}
                    </Link>
                    <Link
                        href="/admin/submissions?tab=reviewed"
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${tab === 'reviewed'
                            ? 'bg-neutral-600 text-white shadow-lg shadow-neutral-600/20'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        HISTORIAL
                    </Link>
                </div>
            </div>

            <SubmissionsGrid submissions={submissions} tab={tab} />
        </div>
    );
}
