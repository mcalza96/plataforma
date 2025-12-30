import { notFound } from 'next/navigation';
import CourseForm from './CourseForm';
import { getCourseService, getLessonService } from '@/lib/di';
import AdminBreadcrumbsResolver from '@/components/admin/AdminBreadcrumbsResolver';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
    const { id } = await params;

    let course = null;
    let lessons: any[] = [];

    if (id !== 'new') {
        const courseService = getCourseService();
        const lessonService = getLessonService();

        course = await courseService.getCourseById(id);

        if (!course) {
            return notFound();
        }

        lessons = await lessonService.getLessonsByCourseId(id);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <AdminBreadcrumbsResolver courseId={id !== 'new' ? id : undefined} />

            <CourseForm course={course} lessons={lessons} />
        </div>
    );
}
