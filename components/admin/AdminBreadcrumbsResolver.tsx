import { getCourseService, getLessonService } from '@/lib/di';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface AdminBreadcrumbsResolverProps {
    courseId?: string;
    lessonId?: string;
}

/**
 * AdminBreadcrumbsResolver: High-level wayfinding orchestrator (Server Component).
 * SRP: Responsibility is to resolve DB IDs into human-readable titles.
 * Provides a clean NavigationItem structure to the UI.
 */
export default async function AdminBreadcrumbsResolver({ courseId, lessonId }: AdminBreadcrumbsResolverProps) {
    const courseService = getCourseService();
    const lessonService = getLessonService();

    const items: BreadcrumbItem[] = [
        { label: 'Comando', href: '/admin' },
        { label: 'Misiones', href: '/admin/courses' },
    ];

    if (courseId) {
        const course = await courseService.getCourseById(courseId);
        if (course) {
            items.push({
                label: course.title,
                href: `/admin/courses/${courseId}`,
                isLast: !lessonId
            });
        }
    }

    if (courseId && lessonId) {
        const lesson = await lessonService.getLessonById(lessonId);
        if (lesson) {
            items.push({
                label: `Fase ${lesson.order}: ${lesson.title}`,
                href: `/admin/courses/${courseId}/phases/${lessonId}`,
                isLast: true
            });
        }
    }

    return <Breadcrumbs items={items} />;
}
