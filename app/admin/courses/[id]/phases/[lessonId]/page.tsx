import { notFound } from 'next/navigation';
import { getCourseService, getLessonService } from '@/lib/di';
import PhaseEditor from './PhaseEditor';
import AdminBreadcrumbsResolver from '@/components/admin/AdminBreadcrumbsResolver';
import PhaseNavigator from '@/components/admin/PhaseNavigator';

interface PageProps {
    params: Promise<{ id: string; lessonId: string }>;
}

export default async function EditPhasePage({ params }: PageProps) {
    const { id, lessonId } = await params;

    const courseService = getCourseService();
    const lessonService = getLessonService();

    // Fetch essential data
    const [course, lesson, allLessons] = await Promise.all([
        courseService.getCourseById(id),
        lessonService.getLessonById(lessonId),
        lessonService.getLessonsByCourseId(id)
    ]);

    if (!course || !lesson) return notFound();

    // Fetch wayfinding context
    const adjacent = await lessonService.getAdjacentLessons(id, lesson.order);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            {/* Wayfinding System */}
            <div className="space-y-4">
                <AdminBreadcrumbsResolver courseId={id} lessonId={lessonId} />

                <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                    <PhaseNavigator courseId={id} adjacent={adjacent} />
                </div>
            </div>

            {/* Atomic Core Editor */}
            <PhaseEditor
                courseId={id}
                lesson={lesson}
                allLessons={allLessons}
            />
        </div>
    );
}
