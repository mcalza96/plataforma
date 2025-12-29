import { ILessonRepository } from '../../repositories/lesson-repository';
import { Lesson, UpsertLessonInput } from '../../domain/course';
import { createClient } from '../../supabase-server';

/**
 * Supabase implementation of the ILessonRepository.
 */
export class SupabaseLessonRepository implements ILessonRepository {

    async upsertLesson(data: UpsertLessonInput): Promise<Lesson> {
        const supabase = await createClient();

        const payload: any = {
            ...data,
            updated_at: new Date().toISOString()
        };

        const { data: lesson, error } = await supabase
            .from('lessons')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error upserting lesson in repository:', error);
            throw new Error('Could not save lesson');
        }

        return lesson;
    }

    async deleteLesson(lessonId: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (error) {
            console.error('Error deleting lesson in repository:', error);
            throw new Error('Could not delete lesson');
        }
    }

    async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        if (error) {
            console.error('Error fetching lessons by course ID in repository:', error);
            return [];
        }

        return data || [];
    }

    async getMaxOrder(courseId: string): Promise<number> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('lessons')
            .select('order')
            .eq('course_id', courseId)
            .order('order', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching max order in repository:', error);
            return 0;
        }

        return data?.order || 0;
    }
}
