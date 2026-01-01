import { notFound } from 'next/navigation';
import CourseForm from './CourseForm';
import { getCourseService, getLessonService } from '@/lib/infrastructure/di';
import AdminBreadcrumbsResolver from '@/components/admin/AdminBreadcrumbsResolver';
import { CourseMapper } from '@/lib/application/mappers/course-mapper';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
    const { id } = await params;

    let courseDTO = null;
    let lessonsDTOs: any[] = [];

    if (id !== 'new') {
        const courseService = getCourseService();
        const lessonService = getLessonService();

        const courseEntity = await courseService.getCourseById(id);

        if (!courseEntity) {
            return notFound();
        }

        courseDTO = CourseMapper.toDTO(courseEntity);

        const lessonsEntities = await lessonService.getLessonsByCourseId(id);
        lessonsDTOs = lessonsEntities.map(l => CourseMapper.lessonToDTO(l));
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <AdminBreadcrumbsResolver courseId={id !== 'new' ? id : undefined} />

            <CourseForm course={courseDTO} lessons={lessonsDTOs} />
        </div>
    );
}
