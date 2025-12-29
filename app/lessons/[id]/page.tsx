import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCourseWithLessonsAndProgress } from '@/lib/courses';
import LessonHeader from '@/components/dashboard/LessonHeader';
import LessonClient from './lesson-client';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
    const { id: courseId } = await params;
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    const courseData = await getCourseWithLessonsAndProgress(courseId, learnerId);

    if (!courseData) {
        return redirect('/dashboard');
    }

    // By default, we show the first lesson of the course
    // In a more advanced version, we could show the last incomplete lesson
    const currentLesson = courseData.lessons[0];

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
                <LessonHeader courseTitle={courseData.title} />
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">construction</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Aún no hay lecciones</h2>
                    <p className="text-gray-400">Este curso se encuentra en preparación. ¡Vuelve pronto!</p>
                </div>
            </div>
        );
    }

    // Get progress for the current lesson
    const lessonProgress = courseData.learnerProgress.find(p => p.lesson_id === currentLesson.id);

    return (
        <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white">
            <LessonHeader courseTitle={courseData.title} />
            <LessonClient
                courseId={courseId}
                learnerId={learnerId}
                lesson={currentLesson}
                initialProgress={lessonProgress}
            />
        </div>
    );
}
