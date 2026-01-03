import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getStudentSubmissions } from '@/lib/actions/shared/storage-actions';
import { getStudentById } from '@/lib/data/learner';
import { Submission } from '@/lib/domain/dtos/learner';
import UploadZone from '@/components/gallery/UploadZone';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default async function GalleryPage() {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        return redirect('/student');
    }

    const student = await getStudentById(studentId);
    if (!student) return redirect('/student');

    const submissions = await getStudentSubmissions(studentId);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {/* Student Info Hero */}
                <section className="mb-12 flex flex-col items-center text-center">
                    <div className="size-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-1 mb-6 shadow-2xl avatar-glow">
                        <div className="w-full h-full rounded-[2.2rem] bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                            <OptimizedImage
                                src={student.avatar_url || ''}
                                alt={student.display_name}
                                fill
                                className="object-cover"
                                fallbackIcon="person"
                            />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
                        Portafolio de <span className="text-primary">{student.display_name}</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Historial de Evidencia • Nivel {student.level}</p>
                    <p className="text-gray-400 mt-3 text-lg max-w-2xl">
                        Repositorio centralizado de registros diagnósticos y evidencia de desempeño para cada sesión de análisis.
                    </p>
                </section>

                {/* Upload Section */}
                <section className="mb-20">
                    <UploadZone studentId={studentId} />
                </section>

                {/* Grid Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <span className="material-symbols-outlined text-primary">database</span>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Registros de Desempeño</h2>
                    </div>

                    {submissions.length === 0 ? (
                        <EmptyState
                            icon="analytics"
                            title="Tu portafolio está vacío"
                            description="Carga tu primer registro de análisis para iniciar tu historial de evidencia basada en datos."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {submissions.map((submission: Submission) => (
                                <Link
                                    key={submission.id}
                                    href={`/gallery/${submission.id}`}
                                    className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transform hover:-translate-y-1"
                                >
                                    <div className="relative aspect-video bg-black overflow-hidden">
                                        {/* Video Preview or Thumbnail Placeholder */}
                                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-white/10 group-hover:scale-125 transition-transform duration-500">movie</span>
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                                        <div className="absolute bottom-4 left-4 right-4 z-10 transition-transform duration-500 group-hover:translate-x-1">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">
                                                {submission.category || 'Análisis Libre'}
                                            </p>
                                            <h3 className="text-white font-black italic uppercase tracking-tighter line-clamp-1">
                                                {submission.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
