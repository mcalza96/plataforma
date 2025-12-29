import 'server-only';
import { createClient } from '../supabase-server';
import { cache } from 'react';

// Interfaces / DTOs
export interface LessonDTO {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    video_url: string;
    download_url: string | null;
    order: number;
    total_steps: number;
}

export interface LearnerProgressDTO {
    id: string;
    learner_id: string;
    lesson_id: string;
    completed_steps: number;
    is_completed: boolean;
}

export interface CourseCardDTO {
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

export interface CourseDetailDTO extends CourseCardDTO {
    lessons: LessonDTO[];
    learnerProgress: LearnerProgressDTO[];
}

export interface LearnerDTO {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
}

/**
 * Fetch all courses with progress for a specific learner.
 * Optimized with React.cache for per-request memoization.
 */
export const getCoursesWithProgress = cache(async (learnerId: string): Promise<CourseCardDTO[]> => {
    const supabase = await createClient();

    const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
            *,
            lessons (id, total_steps)
        `)
        .order('created_at', { ascending: true });

    if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return [];
    }

    const { data: progress, error: progressError } = await supabase
        .from('learner_progress')
        .select('*')
        .eq('learner_id', learnerId);

    if (progressError) {
        console.error('Error fetching progress:', progressError);
    }

    return courses.map((course: any) => {
        const courseLessons = course.lessons || [];
        const totalSteps = courseLessons.reduce((acc: number, lesson: any) => acc + lesson.total_steps, 0);

        const courseProgress = progress?.filter((p: any) =>
            courseLessons.some((l: any) => l.id === p.lesson_id)
        ) || [];

        const completedSteps = courseProgress.reduce((acc: number, p: any) => acc + (p.completed_steps || 0), 0);
        const isCompleted = courseProgress.length > 0 && courseProgress.every((p: any) => p.is_completed);

        return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level_required: course.level_required,
            category: course.category,
            progress: {
                completed_steps: completedSteps,
                total_steps: totalSteps || 5,
                is_completed: isCompleted
            }
        };
    });
});

/**
 * Fetch a single course with its lessons and learner progress.
 */
export const getCourseWithLessonsAndProgress = cache(async (courseId: string, learnerId: string): Promise<CourseDetailDTO | null> => {
    const supabase = await createClient();

    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
            *,
            lessons (*)
        `)
        .eq('id', courseId)
        .single();

    if (courseError || !course) {
        console.error('Error fetching course details:', courseError);
        return null;
    }

    // Sort lessons by 'order'
    course.lessons.sort((a: any, b: any) => a.order - b.order);

    const lessonIds = course.lessons.map((l: any) => l.id);
    const { data: progress, error: progressError } = await supabase
        .from('learner_progress')
        .select('*')
        .eq('learner_id', learnerId)
        .in('lesson_id', lessonIds);

    if (progressError) {
        console.error('Error fetching learner progress:', progressError);
    }

    return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        level_required: course.level_required,
        category: course.category,
        lessons: course.lessons,
        learnerProgress: progress || [],
        progress: {
            completed_steps: (progress || []).reduce((acc: number, p: any) => acc + (p.completed_steps || 0), 0),
            total_steps: course.lessons.reduce((acc: number, l: any) => acc + l.total_steps, 0),
            is_completed: (progress || []).length > 0 && (progress || []).every((p: any) => p.is_completed)
        }
    };
});

/**
 * Fetch learner profile by ID.
 */
export const getLearnerById = cache(async (learnerId: string): Promise<LearnerDTO | null> => {
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
});

/**
 * Fetch the next lesson in the course sequence.
 */
export const getNextLesson = cache(async (courseId: string, currentOrder: number): Promise<LessonDTO | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .gt('order', currentOrder)
        .order('order', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching next lesson:', error);
        return null;
    }
    return data;
});
