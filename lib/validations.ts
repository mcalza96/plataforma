import { z } from 'zod';

// --- Auth Schemas ---
export const AuthSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// --- Course & Lesson Schemas ---
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

// --- Feedback Schemas ---
export const FeedbackSchema = z.object({
    submissionId: z.string().uuid(),
    learnerId: z.string().uuid(),
    content: z.string().min(10, 'El feedback debe ser constructivo (min 10 caracteres)'),
    badgeId: z.string().uuid().optional().nullable(),
});
