import { ILessonRepository } from '../../domain/repositories/lesson-repository';
import { Lesson } from '../../domain/entities/course';
import { UpsertLessonInput, LessonNode } from '../../domain/dtos/course';
import { Submission, Achievement, StudentProgress } from '../../domain/dtos/learner';

import { createClient } from './supabase-server';
import { CourseMapper } from '../../application/mappers/course-mapper';

/**
 * Supabase implementation of the IStudentRepository (formerly ILessonRepository).
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

        return CourseMapper.lessonToDomain(lesson);
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

    async getLessonById(lessonId: string): Promise<Lesson | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching lesson by ID in repository:', error);
            return null;
        }

        return data ? CourseMapper.lessonToDomain(data) : null;
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

        return (data || []).map(l => CourseMapper.lessonToDomain(l));
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

    async markStepComplete(
        studentId: string,
        lessonId: string,
        completedSteps: number,
        isCompleted: boolean
    ): Promise<void> {
        const supabase = await createClient();

        const { error } = await supabase
            .from('learner_progress')
            .upsert({
                learner_id: studentId,
                lesson_id: lessonId,
                completed_steps: completedSteps,
                is_completed: isCompleted,
                last_watched_at: new Date().toISOString()
            }, {
                onConflict: 'learner_id,lesson_id'
            });

        if (error) {
            console.error('Error updating progress in repository:', error);
            throw new Error('Could not update progress');
        }
    }

    async getAdminSubmissions(filter: 'pending' | 'reviewed'): Promise<Submission[]> {
        const supabase = await createClient();

        const query = supabase
            .from('submissions')
            .select(`
                *,
                student:learners (id, display_name, avatar_url, level),
                lesson:lessons (id, title)
            `)
            .order('created_at', { ascending: filter === 'pending' });

        if (filter === 'pending') {
            query.eq('is_reviewed', false);
        } else {
            query.eq('is_reviewed', true);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching submissions in repository:', error);
            return [];
        }
        return data || [];
    }

    async getSubmissionDetail(id: string): Promise<Submission | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                student:learners (*, profiles (email)),
                lesson:lessons (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async submitReview(data: {
        submissionId: string;
        studentId: string;
        content: string;
        badgeId?: string | null;
    }): Promise<void> {
        const supabase = await createClient();

        // 1. Get teacher_id
        const { data: studentData } = await supabase
            .from('learners')
            .select('teacher_id')
            .eq('id', data.studentId)
            .single();

        // 2. Insert feedback message
        const { error: msgError } = await supabase
            .from('feedback_messages')
            .insert({
                learner_id: data.studentId,
                teacher_id: studentData?.teacher_id,
                sender_name: 'Profesor TeacherOS',
                content: data.content,
                is_read_by_learner: false
            });

        if (msgError) throw msgError;

        // 3. Award badge if selected
        if (data.badgeId) {
            await supabase
                .from('learner_achievements')
                .upsert({
                    learner_id: data.studentId,
                    achievement_id: data.badgeId
                }, { onConflict: 'learner_id,achievement_id' });
        }

        // 4. Mark submission as reviewed (if provided)
        if (data.submissionId && data.submissionId !== '00000000-0000-0000-0000-000000000000') {
            const { error: subError } = await supabase
                .from('submissions')
                .update({ is_reviewed: true })
                .eq('id', data.submissionId);

            if (subError) throw subError;
        }
    }

    async getAvailableBadges(): Promise<Achievement[]> {
        const supabase = await createClient();
        const { data } = await supabase.from('achievements').select('*').order('level_required');
        return data || [];
    }

    async getStudentFeedback(studentId: string): Promise<any[]> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('feedback_messages')
            .select('*')
            .eq('learner_id', studentId)
            .order('created_at', { ascending: false });
        return data || [];
    }

    async getUnreadFeedbackCount(studentId: string): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from('feedback_messages')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', studentId)
            .eq('is_read_by_learner', false);

        if (error) return 0;
        return count || 0;
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('feedback_messages')
            .update({ is_read_by_learner: true })
            .eq('id', messageId);

        if (error) throw error;
    }

    async createSubmission(data: {
        studentId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission> {
        const supabase = await createClient();
        const { data: dbData, error: dbError } = await supabase
            .from('submissions')
            .insert({
                learner_id: data.studentId,
                lesson_id: data.lessonId || null,
                title: data.title || 'Mi Obra Maestra',
                file_url: data.fileUrl,
                category: data.category || 'General',
                thumbnail_url: null
            })
            .select()
            .single();

        if (dbError) {
            console.error('Error inserting submission in repository:', dbError);
            throw new Error('Error al registrar la entrega en la base de datos');
        }

        return dbData;
    }

    async getStudentSubmissions(studentId: string): Promise<Submission[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                lessons (title)
            `)
            .eq('learner_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions in repository:', error);
            return [];
        }

        return data || [];
    }

    async checkLessonPath(lessonId: string, studentId: string): Promise<LessonNode[]> {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('get_lesson_path_status', {
            target_lesson_id: lessonId,
            learner_uuid: studentId
        });

        if (error) {
            console.error('Error checking lesson path:', error);
            return [];
        }

        return data || [];
    }
}
