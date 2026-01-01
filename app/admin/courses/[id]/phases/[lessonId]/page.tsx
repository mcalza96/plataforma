import { getLessonService } from '@/lib/infrastructure/di';
import { notFound } from 'next/navigation';
import PhaseWorkshop from './PhaseWorkshop';
import { CourseMapper } from '@/lib/application/mappers/course-mapper';

interface PhasePageProps {
    params: Promise<{
        id: string;
        lessonId: string;
    }>;
}

/**
 * Orchestrator: This Server Component fetches the initial state
 * and hydrates the Client Side Phase Workshop.
 */
export default async function PhaseEditorPage({ params }: PhasePageProps) {
    const { id: courseId, lessonId } = await params;
    const service = getLessonService();
    const lessonEntity = await service.getLessonById(lessonId);

    if (!lessonEntity) {
        notFound();
    }

    const lessonDTO = CourseMapper.lessonToDTO(lessonEntity);

    return (
        <PhaseWorkshop
            initialLesson={lessonDTO}
            courseId={courseId}
        />
    );
}
