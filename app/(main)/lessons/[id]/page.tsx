import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCourseWithLessonsAndProgress } from '@/lib/data/courses';
import LessonHeader from '@/components/dashboard/LessonHeader';
import LessonClient from './lesson-client';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ lessonId?: string }>;
}

export default async function LessonPage({ params, searchParams }: PageProps) {
    const { id: courseId } = await params;
    const { lessonId } = await searchParams;
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        return redirect('/select-profile');
    }

    const courseData = await getCourseWithLessonsAndProgress(courseId, studentId);

    if (!courseData) {
        return redirect('/dashboard');
    }

    // Find the current lesson based on the query param or default to the first one
    const lessons = courseData.lessons;
    const currentLesson = lessonId
        ? lessons.find(l => l.id === lessonId)
        : lessons[0];

    if (!currentLesson) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
                <LessonHeader courseTitle={courseData.title} />
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">construction</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Lección no encontrada</h2>
                    <p className="text-gray-400">Esta lección no existe en el curso. <Link href={`/lessons/${courseId}`} className="text-primary underline">Volver a la primera clase</Link>.</p>
                </div>
            </div>
        );
    }

    // Find next lesson for navigation
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = lessons[currentIndex + 1];

    // Get progress for the current lesson
    const lessonProgress = courseData.studentProgress.find(p => p.lesson_id === currentLesson.id);

    return (
        <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white">
            <LessonHeader courseTitle={courseData.title} />
            <LessonClient
                courseId={courseId}
                studentId={studentId}
                lesson={currentLesson}
                initialProgress={lessonProgress}
                nextLessonId={nextLesson?.id}
            />
        </div>
    );
}

import Link from 'next/link';
