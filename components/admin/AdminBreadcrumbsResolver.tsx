import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
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
    const supabase = await createClient();

    const items: BreadcrumbItem[] = [
        { label: 'Comando', href: '/admin' },
        { label: 'Misiones', href: '/admin/courses' },
    ];

    if (courseId) {
        const { data: course } = await supabase
            .from('courses')
            .select('title')
            .eq('id', courseId)
            .single();

        if (course) {
            items.push({
                label: course.title,
                href: `/admin/courses/${courseId}`,
                isLast: !lessonId
            });
        }
    }

    if (courseId && lessonId) {
        const { data: lesson } = await supabase
            .from('lessons')
            .select('title, order')
            .eq('id', lessonId)
            .single();

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
