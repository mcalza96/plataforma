import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCoursesWithProgress, getLearnerById, CourseWithProgress } from '@/lib/courses';
import { getInstructorFeedback } from '@/lib/parent';
import CourseCard from '@/components/dashboard/CourseCard';
import Link from 'next/link';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    const learner = await getLearnerById(learnerId);
    if (!learner) {
        return redirect('/select-profile');
    }

    const [courses, feedback] = await Promise.all([
        getCoursesWithProgress(learnerId),
        getInstructorFeedback(learnerId)
    ]);

    // Dividimos en misiones activas (con progreso > 0) y nuevas
    const activeMissions = courses.filter(c => c.progress && c.progress.completed_steps > 0);
    const newChallenges = courses.filter(c => !c.progress || c.progress.completed_steps === 0);
    const recentFeedback = feedback.slice(0, 1); // Only show the most recent message as a notification

    return (
        <main className="flex-1 flex justify-center py-8 px-4 sm:px-10 lg:px-20 bg-[#121e26]">
            <div className="flex flex-col max-w-[1200px] w-full gap-10">

                {/* Welcome Section */}
                <div className="flex flex-wrap justify-between items-end gap-6 pb-4 border-b border-[#223949]">
                    <div className="flex min-w-72 flex-col gap-2">
                        <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                            Hola, <span className="text-primary">{learner.display_name}.</span>
                        </h1>
                        <p className="text-[#90b2cb] text-lg font-normal leading-normal">
                            {activeMissions.length > 0
                                ? 'Tu estudio creativo está listo. ¿Qué vamos a crear hoy?'
                                : '¡Tu lienzo está esperando! Elige tu primera misión abajo.'}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-[#90b2cb] uppercase tracking-wider">Nivel Actual</span>
                            <span className="text-xl font-bold text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-secondary fill-1">bolt</span>
                                Artista Nvl. {learner.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Professor Feedback Notification */}
                {recentFeedback.length > 0 && (
                    <div className="bg-gradient-to-r from-primary/20 to-neon-violet/20 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border-2 border-primary/30">
                            <span className="material-symbols-outlined text-3xl text-primary">chat_bubble</span>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Nuevo mensaje de tu Instructor</p>
                            <p className="text-white text-lg font-medium leading-tight">
                                "{recentFeedback[0].content}"
                            </p>
                        </div>
                        <Link
                            href="/parent-dashboard" // Parents can see all history, or we could have a child view later
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
                        >
                            Ver todo
                        </Link>
                    </div>
                )}

                {/* Active Missions Section */}
                {activeMissions.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white tracking-tight text-[28px] font-bold leading-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">rocket_launch</span>
                                Misiones Activas
                            </h2>
                            <a className="text-sm font-bold text-primary hover:text-blue-400 transition-colors flex items-center gap-1" href="#">
                                Ver todo <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeMissions.map((course: CourseWithProgress) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={course.title}
                                    category={course.category}
                                    thumbnailUrl={course.thumbnail_url}
                                    completedSteps={course.progress?.completed_steps || 0}
                                    totalSteps={course.progress?.total_steps || 5}
                                    status={course.progress?.is_completed ? 'Pausado' : 'En Progreso'}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State Messaging if no active missions */}
                {activeMissions.length === 0 && (
                    <section className="bg-surface-dark border border-dashed border-[#223949] rounded-2xl p-12 text-center">
                        <div className="bg-primary/10 size-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <span className="material-symbols-outlined text-4xl">draw</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">¡Comienza tu aventura!</h3>
                        <p className="text-[#90b2cb] max-w-sm mx-auto">
                            Aún no tienes misiones activas. Elige uno de los desafíos de abajo para empezar a crear tu obra maestra.
                        </p>
                    </section>
                )}

                {/* Explore Challenges Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white tracking-tight text-[28px] font-bold leading-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-secondary">explore</span>
                            Explorar Desafíos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {newChallenges.map((course: CourseWithProgress) => (
                            <div
                                key={course.id}
                                className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-[#121e26] border border-[#223949] hover:bg-surface-dark transition-colors cursor-pointer"
                            >
                                <div
                                    className="w-full sm:w-48 aspect-video sm:aspect-auto bg-cover bg-center"
                                    style={{ backgroundImage: `url('${course.thumbnail_url}')` }}
                                />
                                <div className="p-5 flex flex-col justify-center flex-1 gap-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1 text-left">
                                            <h3 className="text-white text-lg font-bold">{course.title}</h3>
                                            <p className="text-[#90b2cb] text-sm">{course.description}</p>
                                        </div>
                                        <Link
                                            href={`/lessons/${course.id}`}
                                            className="size-8 rounded-full bg-[#223949] flex items-center justify-center group-hover:bg-primary transition-colors text-white"
                                        >
                                            <span className="material-symbols-outlined !text-[20px]">add</span>
                                        </Link>
                                    </div>
                                    {/* Decorative Progress indicator (empty) */}
                                    <div className="mt-2 flex gap-1 opacity-50">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="h-1.5 w-8 rounded-full bg-[#31485a]" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
