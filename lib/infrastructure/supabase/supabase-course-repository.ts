import { ICourseRepository } from '../../repositories/course-repository';
import {
    Course,
    CourseCardDTO,
    CourseDetailDTO,
    Lesson,
    Learner,
    UpsertCourseInput,
    UpsertLessonInput,
    CreateCourseInput
} from '../../domain/course';
import { createClient } from '../../supabase-server';

/**
 * Supabase implementation of the ICourseRepository.
 * Handles database communication and data mapping.
 */
export class SupabaseCourseRepository implements ICourseRepository {

    async getCoursesWithProgress(learnerId: string): Promise<CourseCardDTO[]> {
        const supabase = await createClient();

        // Obtener cursos con sus lecciones asociadas para calcular el progreso total
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select(`
                *,
                lessons (id, total_steps)
            `)
            .order('created_at', { ascending: true });

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
                progress: {
                    completed_steps: completedSteps,
                    total_steps: totalSteps || 5, // Fallback sensible
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

        // Ordenar lecciones por el campo 'order'
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
            lessons: lessons,
            learnerProgress: progress || [],
            progress: {
                completed_steps: completedSteps,
                total_steps: totalSteps,
                is_completed: isCompleted
            }
        };
    }

    async getLearnerById(learnerId: string): Promise<Learner | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('id', learnerId)
            .single();

        if (error) {
            console.error('Error fetching learner in repository:', error);
            return null;
        }

        return data;
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
        return data;
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

        return data;
    }

    async upsertCourse(data: UpsertCourseInput): Promise<Course> {
        const supabase = await createClient();

        const payload: any = {
            ...data,
            updated_at: new Date().toISOString()
        };

        const { data: course, error } = await supabase
            .from('courses')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error upserting course in repository:', error);
            throw new Error('Could not save course');
        }

        return course;
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
}
