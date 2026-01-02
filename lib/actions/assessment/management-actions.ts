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
    const { validateStaff, validateOwnership } = await import("@/lib/infrastructure/auth-utils");

    // Step 1: Validate user is staff
    await validateStaff();

    const supabase = await createClient();

    // Step 2: Fetch exam to check ownership and status
    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id, status')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    // Step 3: Validate ownership (admin bypass handled in helper)
    try {
        await validateOwnership(exam.creator_id);
    } catch (error: any) {
        return { success: false, error: error.message };
    }

    // Step 4: Business rule - cannot delete PUBLISHED exams
    if (exam.status === 'PUBLISHED') {
        return { success: false, error: "Cannot delete a PUBLISHED exam. Forensic immutability protection." };
    }

    // Step 5: Proceed with delete
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
    const { validateStaff, validateOwnership } = await import("@/lib/infrastructure/auth-utils");

    // Step 1: Validate user is staff
    await validateStaff();

    // Step 2: Validate title
    if (!newTitle || newTitle.trim().length === 0) {
        return { success: false, error: "Title cannot be empty" };
    }

    const supabase = await createClient();

    // Step 3: Fetch exam to check ownership and status
    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('creator_id, status')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, error: "Exam not found" };
    }

    // Step 4: Validate ownership (admin bypass handled in helper)
    try {
        await validateOwnership(exam.creator_id);
    } catch (error: any) {
        return { success: false, error: error.message };
    }

    // Step 5: Business rule - cannot update PUBLISHED exams (RLS will also block)
    if (exam.status === 'PUBLISHED') {
        return { success: false, error: "Cannot update a PUBLISHED exam. Forensic immutability protection." };
    }

    // Step 6: Proceed with update
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
