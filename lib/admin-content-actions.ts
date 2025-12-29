'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUserRole } from './auth-utils';
import { getCourseService, getLessonService } from './di';

// --- Schemas (Validación de entrada HTTP) ---

export const CourseSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(5, 'El título debe ser más inspirador (mín. 5 caracteres)'),
    description: z.string().min(20, 'Describe mejor la misión para motivar a los alumnos (mín. 20 caracteres)'),
    level_required: z.coerce.number().min(1, 'Nivel mín. 1').max(10, 'Nivel máx. 10'),
    category: z.string().min(1, 'Selecciona una categoría para el estudio'),
    thumbnail_url: z.string().url('URL de miniatura inválida').optional().or(z.literal('')),
    is_published: z.boolean().optional(),
});

export const LessonSchema = z.object({
    id: z.string().uuid().optional(),
    course_id: z.string().uuid('ID de misión inválido'),
    title: z.string().min(5, 'El título de la fase es muy corto (mín. 5 caracteres)'),
    video_url: z.string().url('Necesitamos una URL de video (MP4/Loom) válida'),
    description: z.string().optional().or(z.literal('')),
    thumbnail_url: z.string().url('URL de miniatura inválida').optional().or(z.literal('')),
    download_url: z.string().url('Formato de link de recursos inválido').optional().or(z.literal('')),
    total_steps: z.coerce.number().min(1, 'Mínimo 1 paso LEGO').max(20, 'Máximo 20 pasos LEGO'),
    order: z.coerce.number().min(1, 'El orden debe ser positivo'),
});

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
