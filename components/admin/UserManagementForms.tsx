'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { createTeacherAction, createStudentAction } from '@/lib/actions/admin/user-management-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/context/ToastContext';

// --- Shared Submit Button ---
function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            disabled={pending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold tracking-tight"
        >
            {pending ? (
                <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    PROCESANDO...
                </span>
            ) : label}
        </Button>
    );
}

// --- Create Teacher Form ---
export function CreateTeacherForm() {
    const { showToast } = useToast();
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const data = Object.fromEntries(formData);
            const res = await createTeacherAction({
                full_name: data.full_name as string,
                email: data.email as string,
                password: data.password as string
            });

            if (res.success) {
                showToast('Perfil Sincronizado: Profesor creado con éxito', 'success');
                // Reset form manually or via key
                const form = document.querySelector('#create-teacher-form') as HTMLFormElement;
                if (form) form.reset();
            } else {
                showToast(res.message || 'Error de sincronización', 'error');
            }
        });
    }

    return (
        <form id="create-teacher-form" action={handleSubmit} className="space-y-4 p-6 bg-surface/30 border border-white/5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">person_add</span>
                Alta de Profesor
            </h3>
            <div className="space-y-3">
                <Input name="full_name" placeholder="Nombre Completo" required className="bg-neutral-900/50 border-white/10 text-white" />
                <Input name="email" type="email" placeholder="Correo Electrónico" required className="bg-neutral-900/50 border-white/10 text-white" />
                <Input name="password" type="password" placeholder="Contraseña Temporal" required minLength={8} className="bg-neutral-900/50 border-white/10 text-white" />
            </div>
            <SubmitButton label="Sincronizar Nuevo Docente" />
        </form>
    );
}

// --- Create Student Form ---
interface CreateStudentFormProps {
    teachers?: { id: string; email: string; full_name: string | null }[];
    isAdmin?: boolean;
}

export function CreateStudentForm({ teachers = [], isAdmin = false }: CreateStudentFormProps) {
    const { showToast } = useToast();

    // Si no es admin, no mostramos el selector de profesores (se asigna auto en server)
    // Pero si es admin, necesitamos multi-select. Por simplicidad usaremos un native multiple select por ahora,
    // o un input controlado para mejor UX.

    async function handleSubmit(formData: FormData) {
        const teacherIds = formData.getAll('teacher_ids') as string[];

        const payload = {
            display_name: formData.get('display_name') as string,
            email: (formData.get('email') as string) || undefined,
            password: (formData.get('password') as string) || undefined,
            teacher_ids: teacherIds
        };

        const res = await createStudentAction(payload);

        if (res.success) {
            showToast('Enlace Auth Creado: Estudiante registrado', 'success');
            const form = document.querySelector('#create-student-form') as HTMLFormElement;
            if (form) form.reset();
        } else {
            showToast(res.message || 'Error de registro', 'error');
        }
    }

    return (
        <form id="create-student-form" action={handleSubmit} className="space-y-4 p-6 bg-surface/30 border border-white/5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">school</span>
                Alta de Estudiante
            </h3>

            <div className="space-y-3">
                <Input name="display_name" placeholder="Nombre del Estudiante" required className="bg-neutral-900/50 border-white/10 text-white" />

                <div className="grid grid-cols-2 gap-3">
                    <Input name="email" type="email" placeholder="Email (Opcional)" className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-600" />
                    <Input name="password" type="password" placeholder="Pass (Opcional)" minLength={6} className="bg-neutral-900/50 border-white/10 text-white placeholder:text-gray-600" />
                </div>

                {isAdmin && teachers.length > 0 && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Asignar Supervisores</label>
                        <select
                            multiple
                            name="teacher_ids"
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-lg p-2 text-white h-32 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
                        >
                            {teachers.map(t => (
                                <option key={t.id} value={t.id} className="p-1">
                                    {t.full_name || t.email}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-600">Mantén Ctrl/Cmd para seleccionar múltiples.</p>
                    </div>
                )}
            </div>
            <SubmitButton label={isAdmin ? "Registrar y Asignar" : "Alistar en Cohorte"} />
        </form>
    );
}
