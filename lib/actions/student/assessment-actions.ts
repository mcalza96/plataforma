'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { cookies } from 'next/headers';

/**
 * getAssessment
 * Retrieves an exam and its configuration after validating the assignment.
 * Professional nomenclature: Student/Professor isolation.
 */
export async function getAssessment(id: string) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        console.error("[AssessmentActions] No student session found.");
        return null;
    }

    // 1. Validate Assignment (Security Rule)
    const { data: assignment, error: assignError } = await supabase
        .from('exam_assignments')
        .select('id')
        .eq('exam_id', id)
        .eq('student_id', studentId)
        .single();

    if (assignError || !assignment) {
        // Fallback for Admin (Admins can view everything)
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

        if (profile?.role !== 'admin') {
            console.warn(`[AssessmentActions] Unauthorized access attempt: Student ${studentId} to Exam ${id}`);
            return null;
        }
    }

    // 2. Fetch Exam Configuration
    const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single();

    if (examError || !exam) {
        console.error("[AssessmentActions] Error fetching exam:", examError);
        return null;
    }

    // 3. Status Check (Only PUBLISHED or Admin)
    if (exam.status !== 'PUBLISHED') {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
        if (profile?.role !== 'admin' && exam.creator_id !== user?.id) {
            return null;
        }
    }

    return exam;
}

/**
 * submitAssessment
 * Processes a student's answer within the context of an exam attempt.
 */
export async function submitAssessment(attemptId: string, questionId: string, selectedOptionId: string, telemetry: any) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        throw new Error("No se encontró una sesión de estudiante activa.");
    }

    // 1. Log forensic evidence (telemetry_logs)
    const { error: logError } = await supabase
        .from('telemetry_logs')
        .insert({
            attempt_id: attemptId,
            event_type: 'ANSWER_UPDATE',
            payload: {
                questionId,
                selectedOptionId,
                telemetry
            }
        });

    if (logError) console.error("Failed to log telemetry:", logError);

    // 2. Update current state of the attempt
    const { data: attempt } = await supabase
        .from('exam_attempts')
        .select('current_state')
        .eq('id', attemptId)
        .single();

    const newState = { ...(attempt?.current_state || {}), [questionId]: selectedOptionId };

    const { error: updateError } = await supabase
        .from('exam_attempts')
        .update({
            current_state: newState,
            updated_at: new Date().toISOString()
        })
        .eq('id', attemptId);

    if (updateError) throw new Error("Error al guardar la respuesta.");

    return { success: true };
}
