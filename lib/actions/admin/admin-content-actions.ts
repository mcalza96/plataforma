'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUserRole, validateAdmin } from '@/lib/infrastructure/auth-utils';
import { getCourseService, getLessonService } from '@/lib/infrastructure/di';

import { CourseSchema, LessonSchema } from '@/lib/validations';

export type ActionResponse<T = any> =
    | { success: true; data: T }
    | { success: false; error: string; issues?: z.ZodIssue[] };

// --- Actions (Thin Controllers) ---

/**
 * Crea o actualiza un curso (Misión)
 */
export async function upsertCourse(data: z.infer<typeof CourseSchema>): Promise<ActionResponse> {
    try {
        const validated = CourseSchema.parse(data);
        const role = await getUserRole();

        const service = getCourseService();
        const result = await service.createOrUpdateCourse(validated, role);

        revalidatePath('/admin/courses');
        revalidatePath('/dashboard');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error in upsertCourse action:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Error de validación en los datos del curso.',
                issues: error.issues
            };
        }

        return { success: false, error: error.message || 'Error inesperado al guardar el curso' };
    }
}

/**
 * Crea o actualiza una lección (Fase)
 */
export async function upsertLesson(data: z.infer<typeof LessonSchema>): Promise<ActionResponse> {
    try {
        const validated = LessonSchema.parse(data);
        const role = await getUserRole();

        const service = getLessonService();
        const result = await service.upsertLesson(validated, role);

        revalidatePath(`/admin/courses/${validated.course_id}`);
        revalidatePath(`/lessons/${validated.course_id}`);
        revalidatePath('/dashboard');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error in upsertLesson action:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Error de validación en la fase.',
                issues: error.issues
            };
        }

        return { success: false, error: error.message || 'Error inesperado al guardar la lección' };
    }
}

/**
 * Elimina un curso
 */
export async function deleteCourse(courseId: string): Promise<ActionResponse<void>> {
    try {
        const role = await getUserRole();
        const service = getCourseService();

        await service.deleteCourse(courseId, role);

        revalidatePath('/admin/courses');
        revalidatePath('/dashboard');

        return { success: true, data: undefined };
    } catch (error: any) {
        console.error('Error in deleteCourse action:', error);
        return { success: false, error: error.message || 'No se pudo eliminar el curso' };
    }
}

/**
 * Elimina una lección
 */
export async function deleteLesson(lessonId: string, courseId: string): Promise<ActionResponse<void>> {
    try {
        const role = await getUserRole();
        const service = getLessonService();

        await service.deleteLesson(lessonId, role);

        revalidatePath(`/admin/courses/${courseId}`);
        revalidatePath('/dashboard');

        return { success: true, data: undefined };
    } catch (error: any) {
        console.error('Error in deleteLesson action:', error);
        return { success: false, error: error.message || 'No se pudo eliminar la lección' };
    }
}
