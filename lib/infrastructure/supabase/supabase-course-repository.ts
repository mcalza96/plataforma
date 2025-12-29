import { ICourseRepository } from '../../repositories/course-repository';
import {
    Course,
    CourseCardDTO,
    CourseDetailDTO,
    Lesson,
    Learner,
    UpsertCourseInput,
    UpsertLessonInput,
    CreateCourseInput,
    FamilyDTO,
    LearnerStats,
    LearnerAchievement
} from '../../domain/course';
import { createClient } from './supabase-server';

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
            .order('title', { ascending: true });

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

    async getFamilies(): Promise<FamilyDTO[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                learners (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching families in repository:', error);
            throw new Error('No se pudieron obtener las familias.');
        }

        return data || [];
    }

    async getFamilyById(id: string): Promise<FamilyDTO | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                learners (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching family in repository:', error);
            throw new Error('No se pudo encontrar la familia solicitada.');
        }

        return data;
    }

    async updateLearnerLevel(learnerId: string, newLevel: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('learners')
            .update({ level: newLevel })
            .eq('id', learnerId);

        if (error) {
            console.error('Error updating learner level in repository:', error);
            throw new Error('Error al actualizar el nivel.');
        }
    }

    async updateUserRole(userId: string, newRole: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user role in repository:', error);
            throw new Error('Error al actualizar el rol.');
        }
    }

    async getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
        const supabase = await createClient();

        // 1. Total Completed Lessons
        const { count: completedLections } = await supabase
            .from('learner_progress')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', learnerId)
            .eq('is_completed', true);

        // 2. Total Submissions (Projects)
        const { count: totalProjects } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', learnerId);

        // 3. Estimated Hours
        const { data: progressData } = await supabase
            .from('learner_progress')
            .select('completed_steps')
            .eq('learner_id', learnerId);

        const totalSteps = progressData?.reduce((acc, curr) => acc + (curr.completed_steps || 0), 0) || 0;
        const hoursPracticed = Math.round((totalSteps * 15) / 60);

        // 4. Skills by Category
        const { data: courses } = await supabase
            .from('courses')
            .select(`
                category,
                lessons (
                    id,
                    total_steps,
                    learner_progress (
                        learner_id,
                        completed_steps
                    )
                )
            `);

        const skillsMap: Record<string, { completed: number; total: number }> = {};

        courses?.forEach(course => {
            const cat = course.category || 'General';
            if (!skillsMap[cat]) skillsMap[cat] = { completed: 0, total: 0 };

            course.lessons?.forEach((lesson: any) => {
                skillsMap[cat].total += lesson.total_steps;
                const progress = lesson.learner_progress?.find((p: any) => p.learner_id === learnerId);
                skillsMap[cat].completed += progress?.completed_steps || 0;
            });
        });

        const skillColors = ['#a855f7', '#0d93f2', '#10b981', '#f59e0b'];
        const skills = Object.entries(skillsMap).map(([name, data], index) => ({
            name,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
            color: skillColors[index % skillColors.length]
        }));

        return {
            totalProjects: totalProjects || 0,
            hoursPracticed: hoursPracticed || 0,
            completedLections: completedLections || 0,
            skills
        };
    }

    async getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learner_achievements')
            .select(`
                unlocked_at,
                achievements (*)
            `)
            .eq('learner_id', learnerId);

        if (error) {
            console.error('Error fetching achievements in repository:', error);
            return [];
        }

        // Map Supabase joined data to the Expected Domain Interface
        // Supabase returns the joined record as an array or object depending on schema
        return (data || []).map((item: any) => ({
            unlocked_at: item.unlocked_at,
            achievements: Array.isArray(item.achievements) ? item.achievements[0] : item.achievements
        })) as LearnerAchievement[];
    }

    async createLearner(data: {
        parentId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Learner> {
        const supabase = await createClient();
        const { data: dbData, error } = await supabase
            .from('learners')
            .insert({
                parent_id: data.parentId,
                display_name: data.displayName,
                avatar_url: data.avatarUrl,
                level: 1
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating learner in repository:', error);
            throw new Error(error.message);
        }

        return dbData;
    }

    async ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase.from('profiles').upsert({
            id: data.id,
            email: data.email,
            full_name: data.fullName,
        });

        if (error) {
            console.error('Error ensuring profile existence in repository:', data.id, error);
            throw new Error(`No se pudo crear tu perfil de padre: ${error.message}.`);
        }
    }

    async getLearnersByParentId(parentId: string): Promise<Learner[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learners')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching learners for parent in repository:', error);
            throw new Error('Error al obtener los alumnos.');
        }

        return data || [];
    }

    async getAllCourses(): Promise<Course[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            console.error('Error fetching all courses in repository:', error);
            throw new Error('Error al obtener los cursos.');
        }

        return data || [];
    }

    async getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }> {
        const supabase = await createClient();

        const [
            { count: totalLearners },
            { count: totalSubmissions },
            { count: totalCourses }
        ] = await Promise.all([
            supabase.from('learners').select('*', { count: 'exact', head: true }),
            supabase.from('submissions').select('*', { count: 'exact', head: true }),
            supabase.from('courses').select('*', { count: 'exact', head: true })
        ]);

        return {
            totalLearners: totalLearners || 0,
            totalSubmissions: totalSubmissions || 0,
            totalCourses: totalCourses || 0
        };
    }
}
