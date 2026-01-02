import { z } from 'zod';

export const FeedbackSchema = z.object({
    submissionId: z.string().uuid(),
    studentId: z.string().uuid(),
    content: z.string().min(10, 'El feedback debe ser constructivo (min 10 caracteres)'),
    badgeId: z.string().uuid().optional().nullable(),
});

export interface Lesson {
    id: string;
    title: string;
    order: number;
    video_url?: string | null;
    thumbnail_url?: string | null;
    description?: string;
    is_published?: boolean;
}

export const CourseSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(5),
    description: z.string(),
    thumbnail_url: z.string().url().optional().nullable(),
    level_required: z.number().min(1).max(10),
    category: z.string(),
    teacher_id: z.string().uuid(),
    is_published: z.boolean(),
    created_at: z.date().optional()
});

export const LessonSchema = z.object({
    id: z.string().uuid(),
    course_id: z.string().uuid().optional(),
    title: z.string().min(3),
    order: z.number(),
    video_url: z.string().url().optional().nullable(),
    thumbnail_url: z.string().url().optional().nullable(),
    description: z.string().optional(),
    is_published: z.boolean().optional(),
    total_steps: z.number().int().min(1).optional()
});

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string | null;
    level_required: number;
    category: string;
    teacher_id: string;
    is_published: boolean;
    created_at: Date;
}
