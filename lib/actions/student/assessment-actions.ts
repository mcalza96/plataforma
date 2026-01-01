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
 * getLatestDiagnosticResult
 * Retrieves the most recent COMPLETED exam attempt for the student
 * that serves as a diagnostic anchor (calibration probe).
 */
export async function getLatestDiagnosticResult() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) return null;

    // Fetch the latest COMPLETED attempt
    const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .select(`
            *,
            exams (
                title,
                type
            )
        `)
        .eq('learner_id', studentId)
        .eq('status', 'COMPLETED')
        .not('results_cache', 'is', null) // Must have processed results
        .order('finished_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !attempt) {
        return null;
    }

    // Return the cached diagnostic result strictly typed
    return attempt.results_cache as any; // Cast to DiagnosticResult in consumption or imported type
}
