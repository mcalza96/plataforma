import { createClient } from './supabase-server';

export interface CourseWithProgress {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    progress?: {
        completed_steps: number;
        total_steps: number;
        is_completed: boolean;
    };
}

export async function getCoursesWithProgress(learnerId: string) {
    const supabase = await createClient();

    // Obtenemos todos los cursos
    const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
      *,
      lessons (
        id,
        total_steps
      )
    `)
        .order('created_at', { ascending: true });

    if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return [];
    }

    // Obtenemos el progreso del alumno para las lecciones
    const { data: progress, error: progressError } = await supabase
        .from('learner_progress')
        .select('*')
        .eq('learner_id', learnerId);

    if (progressError) {
        console.error('Error fetching progress:', progressError);
    }

    // Combinamos los datos
    return courses.map((course: any) => {
        // Calculamos el total de pasos del curso y los completados
        const courseLessons = course.lessons || [];
        const totalSteps = courseLessons.reduce((acc: number, lesson: any) => acc + lesson.total_steps, 0);

        // Buscamos el progreso para las lecciones de este curso
        const courseProgress = progress?.filter((p: any) =>
            courseLessons.some((l: any) => l.id === p.lesson_id)
        ) || [];

        const completedSteps = courseProgress.reduce((acc: number, p: any) => acc + (p.completed_steps || 0), 0);
        const isCompleted = courseProgress.length > 0 && courseProgress.every((p: any) => p.is_completed);

        return {
            ...course,
            progress: {
                completed_steps: completedSteps,
                total_steps: totalSteps || 5, // Fallback a 5 si no hay lecciones aún para visualización
                is_completed: isCompleted
            }
        };
    });
}

export async function getLearnerById(learnerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('learners')
        .select('*')
        .eq('id', learnerId)
        .single();

    if (error) {
        console.error('Error fetching learner:', error);
        return null;
    }

    return data;
}
