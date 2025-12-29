import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLearnerSubmissions } from '@/lib/storage-actions';
import { getLearnerById } from '@/lib/courses';
import Header from '@/components/layout/header';
import UploadZone from '@/components/gallery/UploadZone';
import Image from 'next/image';

export default async function GalleryPage() {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    const learner = await getLearnerById(learnerId);
    if (!learner) return redirect('/select-profile');

    const submissions = await getLearnerSubmissions(learnerId);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface flex items-center justify-center">
                                {learner.avatar_url ? (
                                    <Image src={learner.avatar_url} alt={learner.display_name} width={48} height={48} className="object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-gray-500">person</span>
                                )}
                            </div>
                            <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                                Portfolio de Artista
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Mi Galería de Arte</h1>
                        <p className="text-gray-400 mt-3 text-lg max-w-2xl">
                            Aquí guardamos todos tus videos de Procreate. Cada trazo es un paso más hacia convertirte en un gran maestro digital.
                        </p>
                    </div>
                </div>

                {/* Upload Section */}
                <section className="mb-20">
                    <UploadZone learnerId={learnerId} />
                </section>

                {/* Grid Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">auto_awesome_motion</span>
                            Mis Obras ({submissions.length})
                        </h2>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-16 text-center">
                            <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-600">
                                <span className="material-symbols-outlined text-5xl">folder_open</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-300">Aún no has subido ninguna obra</h3>
                            <p className="text-gray-500 mt-2">Exporta tu primer time-lapse desde Procreate y súbelo para comenzar tu portfolio.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transform hover:-translate-y-1">
                                    <div className="relative aspect-video bg-black overflow-hidden">
                                        {/* Video Preview or Thumbnail */}
                                        <video
                                            src={submission.file_url}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                            muted
                                            onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                            onMouseOut={(e) => {
                                                const v = e.currentTarget as HTMLVideoElement;
                                                v.pause();
                                                v.currentTime = 0;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-primary/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                <span className="material-symbols-outlined">play_arrow</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black/50 backdrop-blur-md text-[10px] font-black text-white px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                                                {submission.category || 'Time-lapse'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                                {submission.title}
                                            </h3>
                                            <span className="material-symbols-outlined text-gray-600 hover:text-white cursor-pointer transition-colors">more_vert</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            {new Date(submission.created_at).toLocaleDateString()}
                                            {submission.lessons && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-700 mx-1"></span>
                                                    <span className="text-primary/70">{submission.lessons.title}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
