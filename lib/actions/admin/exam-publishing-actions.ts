"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateStaff } from "@/lib/infrastructure/auth-utils";

export interface PublishExamResult {
    success: boolean;
    examId?: string;
    error?: string;
}

/**
 * Publishes an exam with an immutable snapshot.
 * Once published, the exam structure is locked for forensic integrity.
 * 
 * Business Rule: Exam immutability ensures that telemetry data remains valid.
 * If questions change after students have responded, historical data loses integrity.
 */
export async function publishExamWithSnapshot(
    title: string,
    qMatrix: any,
    questions: any[],
    context: any
): Promise<PublishExamResult> {
    await validateStaff(); // Allow admin, instructor, teacher
    const supabase = await createClient();

    // Get authenticated user to set as creator
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            success: false,
            error: 'Usuario no autenticado'
        };
    }

    try {
        // 1. Create exam with PUBLISHED status (immutable)
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .insert({
                title,
                creator_id: user.id, // Force creator to be authenticated user
                status: 'PUBLISHED',
                q_matrix: qMatrix,
                metadata: {
                    context,
                    published_at: new Date().toISOString(),
                    is_immutable: true
                }
            })
            .select()
            .single();

        if (examError || !exam) {
            console.error('Error creating exam:', examError);
            return {
                success: false,
                error: 'Failed to create exam in database'
            };
        }

        // 2. Insert questions linked to this exam
        const questionsWithExamId = questions.map(q => ({
            exam_id: exam.id,
            stem: q.stem,
            options: q.options,
            competency_id: q.competencyId,
            expected_time_seconds: q.expectedTime || 60,
            metadata: {
                pedagogical_reasoning: q.pedagogicalReasoning,
                created_by_ai: true
            }
        }));

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsWithExamId);

        if (questionsError) {
            console.error('Error inserting questions:', questionsError);
            // Rollback: delete the exam
            await supabase.from('exams').delete().eq('id', exam.id);
            return {
                success: false,
                error: 'Failed to insert questions'
            };
        }

        return {
            success: true,
            examId: exam.id
        };

    } catch (error) {
        console.error('Unexpected error in publishExamWithSnapshot:', error);
        return {
            success: false,
            error: 'Unexpected error during publish'
        };
    }
}

/**
 * Checks if an exam can be modified (not published/immutable)
 */
export async function canModifyExam(examId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('exams')
        .select('status, metadata')
        .eq('id', examId)
        .single();

    if (!data) return false;

    return data.status !== 'PUBLISHED' && !data.metadata?.is_immutable;
}
