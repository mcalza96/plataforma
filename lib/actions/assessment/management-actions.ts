"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function toggleExamAssignment(examId: string, studentId: string, isActive: boolean) {
    const supabase = await createClient();

    if (isActive) {
        const { error } = await supabase
            .from('exam_assignments')
            .upsert({
                exam_id: examId,
                student_id: studentId,
                status: 'ASSIGNED',
                origin_context: 'standalone'
            });

        if (error) throw new Error(error.message);
    } else {
        const { error } = await supabase
            .from('exam_assignments')
            .delete()
            .match({ exam_id: examId, student_id: studentId });

        if (error) throw new Error(error.message);
    }

    revalidatePath('/admin/exams');
    return { success: true };
}

export async function deleteExam(examId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (exam.creator_id !== user.id && !isAdmin) {
        return { success: false, error: "Unauthorized: only creator or admin can delete." };
    }

    const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

    if (error) {
        console.error("Failed to delete exam:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/exams');
    return { success: true };
}

export async function updateExamTitle(examId: string, newTitle: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: "Unauthorized" };
    }

    if (!newTitle || newTitle.trim().length === 0) {
        return { success: false, error: "Title cannot be empty" };
    }

    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (exam.creator_id !== user.id && !isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('exams')
        .update({ title: newTitle.trim() })
        .eq('id', examId);

    if (error) {
        console.error("Failed to update exam title:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/exams');
    return { success: true };
}
