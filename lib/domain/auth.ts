import { z } from 'zod';

/**
 * Auth Domain Schema
 * Used for login and registration validation.
 */
export const AuthSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type AuthInput = z.infer<typeof AuthSchema>;
