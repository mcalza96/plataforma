import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CourseForm from './course-form';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    let course = null;
    let lessons: any[] = [];

    if (id !== 'new') {
        const { data: courseData, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !courseData) {
            return notFound();
        }
        course = courseData;

        const { data: lessonData } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', id)
            .order('order', { ascending: true });

        lessons = lessonData || [];
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/courses" className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Misiones del Estudio</p>
                        <h1 className="text-3xl font-black tracking-tighter">
                            {id === 'new' ? 'Crear Nueva Misión' : 'Configurar Misión'}
                        </h1>
                    </div>
                </div>
            </div>

            <CourseForm course={course} lessons={lessons} />
        </div>
    );
}
