'use client';

import { useState } from 'react';
import { updateUserRole } from '@/lib/actions/admin/admin-users-actions';
import { useToast } from '@/context/ToastContext';

interface RoleSelectorProps {
    userId: string;
    currentRole: 'admin' | 'instructor' | 'teacher';
    userName: string;
}

export default function RoleSelector({ userId, currentRole, userName }: RoleSelectorProps) {
    const [role, setRole] = useState(currentRole);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleRoleChange = async (newRole: 'admin' | 'instructor' | 'teacher') => {
        if (newRole === role) return;

        if (!confirm(`¿Estás seguro de que quieres cambiar el rol de "${userName}" a ${newRole.toUpperCase()}?`)) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                setRole(newRole);
                showToast('Rol actualizado correctamente', 'success');
            } else {
                showToast(result.error || 'Error al actualizar el rol', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500">shield_person</span>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Gestión de Acceso</h3>
                </div>
                {isLoading && (
                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            <p className="text-xs text-gray-500 font-medium">
                Define los permisos de este usuario en la plataforma.
            </p>

            <div className="grid grid-cols-1 gap-2 mt-2">
                {(['teacher', 'instructor', 'admin'] as const).map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        disabled={isLoading}
                        className={`
                            h-12 px-4 rounded-xl flex items-center justify-between border transition-all active:scale-95
                            ${role === r
                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(13,147,242,0.1)]'
                                : 'bg-transparent border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}
                        `}
                    >
                        <span className="text-xs font-black uppercase tracking-widest">
                            {r === 'admin' ? 'Administrador' : r === 'instructor' ? 'Instructor' : 'Profesor / Institución'}
                        </span>
                        {role === r && (
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                    </button>
                ))}
            </div>

            {role === 'admin' && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                    <p className="text-[10px] text-amber-200/70 font-bold uppercase tracking-wide leading-tight">
                        Este usuario tiene acceso total al panel de comando y gestión de contenidos.
                    </p>
                </div>
            )}
        </div>
    );
}
