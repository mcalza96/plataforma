import { createClient } from './supabase-server';
import { ISubmissionRepository } from '../../domain/repositories/submission-repository';
import { Submission, Achievement } from '../../domain/dtos/learner';

export class SupabaseSubmissionRepository implements ISubmissionRepository {
    async createSubmission(data: any): Promise<Submission> {
        const supabase = await createClient();
        const { data: res, error } = await supabase
            .from('submissions')
            .insert({
                learner_id: data.studentId,
                lesson_id: data.lessonId,
                title: data.title,
                file_url: data.fileUrl,
                category: data.category
            })
            .select()
            .single();

        if (error) throw error;
        return res as Submission;
    }

    async getStudentSubmissions(studentId: string): Promise<Submission[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('submissions')
            .select('*, student:profiles(display_name, level, avatar_url)')
            .eq('learner_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any[];
    }

    async getAdminSubmissions(filter: 'pending' | 'reviewed'): Promise<Submission[]> {
        const supabase = await createClient();
        let query = supabase
            .from('submissions')
            .select('*, student:profiles(display_name, level, avatar_url)')
            .order('created_at', { ascending: false });

        if (filter === 'pending') {
            query = query.eq('is_reviewed', false);
        } else {
            query = query.eq('is_reviewed', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as any[];
    }

    async getSubmissionDetail(id: string): Promise<Submission | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('submissions')
            .select('*, student:profiles(id, display_name, level, avatar_url)')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as any;
    }

    async submitReview(data: any): Promise<void> {
        const supabase = await createClient();

        // 1. Create feedback record
        const { error: fError } = await supabase
            .from('feedback_messages')
            .insert({
                submission_id: data.submissionId,
                learner_id: data.studentId,
                content: data.content,
                badge_id: data.badgeId
            });

        if (fError) throw fError;

        // 2. Mark submission as reviewed
        const { error: sError } = await supabase
            .from('submissions')
            .update({ is_reviewed: true })
            .eq('id', data.submissionId);

        if (sError) throw sError;
    }

    async getAvailableBadges(): Promise<Achievement[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('achievements')
            .select('*');

        if (error) throw error;
        return data as Achievement[];
    }

    async getStudentFeedback(studentId: string): Promise<any[]> {
        const supabase = await createClient();

        // 1. Fetch feedback messages
        const { data: messages, error: mError } = await supabase
            .from('feedback_messages')
            .select('*')
            .eq('learner_id', studentId)
            .order('created_at', { ascending: false });

        if (mError) throw mError;
        if (!messages || messages.length === 0) return [];

        // 2. Extract unique submission IDs to fetch titles
        const submissionIds = [...new Set(messages.filter(m => m.submission_id).map(m => m.submission_id))];

        if (submissionIds.length > 0) {
            const { data: subs, error: sError } = await supabase
                .from('submissions')
                .select('id, title')
                .in('id', submissionIds);

            if (!sError && subs) {
                // 3. Map titles back to messages
                const subsMap = new Map((subs as any[]).map(s => [s.id, s.title]));
                return messages.map(m => ({
                    ...m,
                    submission: m.submission_id ? { title: subsMap.get(m.submission_id) || 'Entrega' } : null
                }));
            }
        }

        return messages;
    }

    async getUnreadFeedbackCount(studentId: string): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from('feedback_messages')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', studentId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('feedback_messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) throw error;
    }
}
