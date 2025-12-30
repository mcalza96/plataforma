import { ICourseReader, ICourseWriter } from '../../domain/repositories/course-repository';
import { Course, Lesson } from '../../domain/entities/course';
import {
    CourseCardDTO,
    CourseDetailDTO,
    UpsertCourseInput,
} from '../../domain/dtos/course';

import { createClient } from './supabase-server';
import { CourseMapper } from '../../application/mappers/course-mapper';

/**
 * Supabase implementation of the segregated course repositories.
 * Handles database communication and data mapping.
 */
export class SupabaseCourseRepository implements ICourseReader, ICourseWriter {

    async getCoursesWithProgress(learnerId: string): Promise<CourseCardDTO[]> {
        const supabase = await createClient();

        // Obtener el rol del usuario para filtrar por ID de maestro si es necesario
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
        const isInstructor = profile?.role === 'instructor';

        let query = supabase
            .from('courses')
            .select(`
                *,
                lessons (id, total_steps)
            `)
            .order('title', { ascending: true });

        if (isInstructor && user) {
            query = query.eq('teacher_id', user.id);
        }

        const { data: courses, error: coursesError } = await query;

        if (coursesError) {
            console.error('Error fetching courses in repository:', coursesError);
            return [];
        }

        // Obtener progreso del estudiante
        const { data: progress, error: progressError } = await supabase
            .from('learner_progress')
            .select('*')
            .eq('learner_id', learnerId);

        if (progressError) {
            console.error('Error fetching progress in repository:', progressError);
        }

        return courses.map((course: any) => {
            const courseLessons = course.lessons || [];
            const totalSteps = courseLessons.reduce((acc: number, lesson: any) => acc + (lesson.total_steps || 0), 0);

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
                teacher_id: course.teacher_id,
                progress: {
                    completed_steps: completedSteps,
                    total_steps: totalSteps || 5,
                    is_completed: isCompleted
                }
            };
        });
    }

    async getCourseWithLessonsAndProgress(courseId: string, learnerId: string): Promise<CourseDetailDTO | null> {
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
            console.error('Error fetching course details in repository:', courseError);
            return null;
        }

        const lessons = (course.lessons || []).sort((a: any, b: any) => a.order - b.order);
        const lessonIds = lessons.map((l: any) => l.id);

        const { data: progress, error: progressError } = await supabase
            .from('learner_progress')
            .select('*')
            .eq('learner_id', learnerId)
            .in('lesson_id', lessonIds);

        if (progressError) {
            console.error('Error fetching learner progress in repository:', progressError);
        }

        const completedSteps = (progress || []).reduce((acc: number, p: any) => acc + (p.completed_steps || 0), 0);
        const totalSteps = lessons.reduce((acc: number, l: any) => acc + (l.total_steps || 0), 0);
        const isCompleted = (progress || []).length > 0 && (progress || []).every((p: any) => p.is_completed);

        return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level_required: course.level_required,
            category: course.category,
            teacher_id: course.teacher_id,
            lessons: lessons,
            learnerProgress: progress || [],
            is_published: course.is_published,
            progress: {
                completed_steps: completedSteps,
                total_steps: totalSteps,
                is_completed: isCompleted
            }
        };
    }

    async getCourseById(courseId: string): Promise<Course | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (error) {
            console.error('Error fetching course by ID in repository:', error);
            return null;
        }

        return data ? CourseMapper.toDomain(data) : null;
    }

    async getNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null> {
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
            console.error('Error fetching next lesson in repository:', error);
            return null;
        }
        return data ? CourseMapper.lessonToDomain(data) : null;
    }

    async upsertCourse(data: UpsertCourseInput): Promise<Course> {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const payload: any = {
            ...data,
            updated_at: new Date().toISOString()
        };

        if (!data.id && user) {
            payload.teacher_id = user.id;
        }

        const { data: course, error } = await supabase
            .from('courses')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error upserting course in repository:', error);
            throw new Error('Could not save course');
        }

        return CourseMapper.toDomain(course);
    }

    async deleteCourse(courseId: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (error) {
            console.error('Error deleting course in repository:', error);
            throw new Error('Could not delete course');
        }
    }

    async getAllCourses(): Promise<Course[]> {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
        const isInstructor = profile?.role === 'instructor';

        let query = supabase
            .from('courses')
            .select('*')
            .order('title', { ascending: true });

        if (isInstructor && user) {
            query = query.eq('teacher_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching all courses in repository:', error);
            throw new Error('Error al obtener los cursos.');
        }

        return (data || []).map(c => CourseMapper.toDomain(c));
    }
}
