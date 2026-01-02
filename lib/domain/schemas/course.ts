import { z } from 'zod';

export const FeedbackSchema = z.object({
    submissionId: z.string().uuid(),
    studentId: z.string().uuid(),
    content: z.string().min(10, 'El feedback debe ser constructivo (min 10 caracteres)'),
    badgeId: z.string().uuid().optional().nullable(),
});
