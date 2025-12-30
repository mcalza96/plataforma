import { getLessonService } from '@/lib/di';
import { notFound } from 'next/navigation';
import PhaseWorkshop from './PhaseWorkshop';

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
    const lesson = await service.getLessonById(lessonId);

    if (!lesson) {
        notFound();
    }

    return (
        <PhaseWorkshop
            initialLesson={lesson}
            courseId={courseId}
        />
    );
}
