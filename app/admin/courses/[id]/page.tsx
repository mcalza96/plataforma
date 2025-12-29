import { notFound } from 'next/navigation';
import Link from 'next/link';
import CourseForm from './CourseForm';
import { getCourseService, getLessonService } from '@/lib/di';

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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-white/5 group">
                    <span className="material-symbols-outlined text-gray-500 group-hover:text-amber-500 transition-colors">arrow_back</span>
                </Link>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Volver a todas las misiones</p>
            </div>

            <CourseForm course={course} lessons={lessons} />
        </div>
    );
}
