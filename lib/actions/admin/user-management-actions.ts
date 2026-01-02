'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServiceRoleClient, createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { validateAdmin, validateStaff, getUserId, isAdmin } from '@/lib/infrastructure/auth-utils';
import { TeacherCreationSchema, StudentCreationSchema } from '@/lib/validations';

// --- Actions ---

/**
 * Acción para crear un Profesor (Admin-Only).
 * Implementa patrón de doble escritura: Auth + Profiles.
 */
export async function createTeacherAction(input: z.infer<typeof TeacherCreationSchema>) {
    try {
        await validateAdmin();
        const safeParse = TeacherCreationSchema.safeParse(input);

        if (!safeParse.success) {
            return { success: false, message: safeParse.error.issues[0].message };
        }

        const { full_name: name, email, password } = safeParse.data;

        // 1. Usar cliente con Service Role para operaciones administrativas de Auth
        const supabaseAdmin = await createServiceRoleClient();

        // 2. Crear usuario en Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                role: 'teacher'
            }
        });

        if (authError) throw new Error(`Error en Auth: ${authError.message}`);
        if (!authData.user) throw new Error('No se pudo crear el usuario en Auth.');

        const newUserId = authData.user.id;

        // 3. Insertar en tabla pública `profiles`
        const { error: dbError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUserId,
                email: email,
                full_name: name,
                role: 'teacher',
                created_at: new Date().toISOString(),
            });

        if (dbError) {
            console.error('CRITICAL: User created in Auth but failed in DB Profile. Rollback needed.', dbError);
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            throw new Error(`Error en Base de Datos: ${dbError.message}`);
        }

        revalidatePath('/admin/users');
        return { success: true, userId: newUserId };

    } catch (error: any) {
        console.error('createTeacherAction failed:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Acción para crear un Estudiante (Admin & Teachers).
 * Soporta creación con/sin cuenta de Auth y asignación M:N.
 */
export async function createStudentAction(input: z.infer<typeof StudentCreationSchema>) {
    try {
        await validateStaff();
        const safeParse = StudentCreationSchema.safeParse(input);

        if (!safeParse.success) {
            return { success: false, message: safeParse.error.issues[0].message };
        }

        const { display_name: name, email, password, teacher_ids: teacherIds } = safeParse.data;

        const supabase = await createClient();
        const supabaseAdmin = await createServiceRoleClient();

        const executorId = await getUserId();
        const isSuperAdmin = await isAdmin();

        let studentUserId: string;

        // 1. Lógica de creación de identidad (Auth vs Solo DB)
        if (email && password) {
            // Caso A: Estudiante con acceso (Login)
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: name,
                    role: 'student'
                }
            });

            if (authError) throw new Error(`Error creando usuario Auth: ${authError.message}`);
            if (!authData.user) throw new Error('Fallo silencioso creando usuario Auth.');

            studentUserId = authData.user.id;

        } else {
            // Caso B: Estudiante gestionado
            studentUserId = crypto.randomUUID();
        }

        // 2. Insertar en tabla `learners`
        const learnerInsertPayload: any = {
            display_name: name,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            level: 1
        };

        if (email && password) {
            learnerInsertPayload.id = studentUserId!;
        }

        const { data: learnerData, error: learnerError } = await supabaseAdmin
            .from('learners')
            .insert(learnerInsertPayload)
            .select()
            .single();

        if (learnerError) {
            // Rollback Auth si falló DB
            if (email && password) {
                await supabaseAdmin.auth.admin.deleteUser(studentUserId!);
            }
            throw new Error(`Error creando registro de estudiante: ${learnerError.message}`);
        }

        const finalStudentId = learnerData.id;

        // 3. Vincular con Profesores (M:N) `teacher_student_mapping`
        let targetTeacherIds: string[] = [];

        if (isSuperAdmin) {
            targetTeacherIds = teacherIds || [];
        } else {
            if (executorId) targetTeacherIds = [executorId];
        }

        if (targetTeacherIds.length > 0) {
            const mappings = targetTeacherIds.map(tid => ({
                teacher_id: tid,
                student_id: finalStudentId
            }));

            const { error: mapError } = await supabaseAdmin
                .from('teacher_student_mapping')
                .insert(mappings);

            if (mapError) {
                console.error('Warning: Student created but mapping failed.', mapError);
                return {
                    success: true,
                    message: 'Estudiante creado, pero hubo un error en la asignación de profesores.',
                    studentId: finalStudentId
                };
            }
        }

        revalidatePath('/admin/users');
        revalidatePath('/dashboard');

        return { success: true, studentId: finalStudentId };

    } catch (error: any) {
        console.error('createStudentAction failed:', error);
        return { success: false, message: error.message };
    }
}
