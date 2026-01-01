import { getCoursesWithProgress } from '@/lib/data/courses';
import { CourseCardDTO as CourseWithProgress } from '@/lib/domain/course';
import CourseCard from '@/components/dashboard/CourseCard';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import EmptyState from '@/components/ui/EmptyState';

interface DashboardActiveMissionsProps {
    studentId: string;
}

export default async function DashboardActiveMissions({ studentId }: DashboardActiveMissionsProps) {
    const courses = await getCoursesWithProgress(studentId);
    const courseList = Array.isArray(courses) ? courses : [];

    const activeMissions = courseList.filter(c => c.progress && c.progress.completed_steps > 0);
    const newChallenges = courseList.filter(c => !c.progress || c.progress.completed_steps === 0);

    return (
        <>
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
                        {activeMissions.map((course: CourseWithProgress, index: number) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                category={course.category}
                                thumbnailUrl={course.thumbnail_url}
                                completedSteps={course.progress?.completed_steps || 0}
                                totalSteps={course.progress?.total_steps || 5}
                                status={course.progress?.is_completed ? 'Pausado' : 'En Progreso'}
                                priority={index === 0}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State Messaging if no active missions */}
            {activeMissions.length === 0 && (
                <EmptyState
                    icon="draw"
                    title="¡Comienza tu aventura!"
                    description="Aún no tienes misiones activas. Elige uno de los desafíos de abajo para empezar a crear tu obra maestra."
                />
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
                    {newChallenges.map((course: CourseWithProgress, index: number) => (
                        <div
                            key={course.id}
                            className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-[#121e26] border border-[#223949] hover:bg-surface-dark transition-colors cursor-pointer"
                        >
                            <div className="w-full sm:w-48 aspect-video sm:aspect-auto relative bg-neutral-900">
                                <OptimizedImage
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    fill
                                    priority={activeMissions.length === 0 && index === 0}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    aspectRatio="aspect-video sm:aspect-auto"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
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
        </>
    );
}
