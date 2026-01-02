'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { validateStaff } from "@/lib/infrastructure/auth-utils";
import { Lesson } from '@/lib/domain/schemas/course';

/**
 * Creates or updates a lesson (phase).
 * Accessible to admin, instructor, and teacher roles.
 */
export async function upsertLesson(lesson: Partial<Lesson>): Promise<Lesson> {
    await validateStaff(); // Allow staff to create/update lessons
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lessons')
        .upsert(lesson)
        .select()
        .single();

    if (error) {
        console.error('Error upserting lesson:', error);
        throw new Error(error.message);
    }

    return data;
}
