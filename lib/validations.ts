import { z } from 'zod';

export const TeacherCreationSchema = z.object({
    full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
    email: z.string().email('Formato de correo electrónico inválido.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export const StudentCreationSchema = z.object({
    display_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    email: z.string().email('Formato de correo electrónico inválido.').optional().or(z.literal('')),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional().or(z.literal('')),
    teacher_ids: z.array(z.string().uuid()).optional().default([]),
});

export const AuthSchema = z.object({
    email: z.string().email('Formato de correo electrónico inválido.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export type TeacherCreationInput = z.infer<typeof TeacherCreationSchema>;
export type StudentCreationInput = z.infer<typeof StudentCreationSchema>;
export type AuthInput = z.infer<typeof AuthSchema>;
