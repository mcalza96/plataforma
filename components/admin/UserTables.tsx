'use client';

import Image from 'next/image';
import Link from 'next/link';
import RoleSelector from '@/components/admin/RoleSelector';

interface Teacher {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
    students?: any[];
}

interface Student {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
    created_at?: string;
    teachers?: { id: string; full_name: string | null; email: string }[];
}

// --- Teacher List Table ---
export function TeacherListTable({ teachers }: { teachers: Teacher[] }) {
    if (teachers.length === 0) {
        return <EmptyState icon="person_off" message="No hay profesores registrados" />;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface/20">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Profesor</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Rol</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Alumnos</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Fecha</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {teachers.map((teacher) => (
                        <tr key={teacher.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 text-amber-500 font-bold">
                                        {teacher.full_name ? teacher.full_name[0] : teacher.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white group-hover:text-amber-500 transition-colors">{teacher.full_name || 'Sin Nombre'}</p>
                                        <p className="text-xs text-gray-500">{teacher.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${teacher.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    }`}>
                                    {teacher.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 font-mono">
                                {teacher.students?.length || 0}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(teacher.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <RoleSelector
                                    currentRole={teacher.role as 'admin' | 'instructor' | 'teacher'}
                                    userId={teacher.id}
                                    userName={teacher.full_name || teacher.email}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Student List Table ---
export function StudentListTable({ students }: { students: Student[] }) {
    if (students.length === 0) {
        return <EmptyState icon="school" message="No hay estudiantes en el registro" />;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface/20">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Aprendiz</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Nivel</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500">Mentores Asignados</th>
                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-gray-500 text-right">Gemelo Digital</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {students.map((student) => (
                        <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors shadow-lg">
                                        <Image
                                            src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                                            alt={student.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {student.display_name}
                                    </p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">military_tech</span>
                                    <span className="font-mono text-white">Lvl {student.level}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {student.teachers && student.teachers.length > 0 ? (
                                        student.teachers.map(t => (
                                            <span key={t.id} title={t.email} className="cursor-help inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-gray-300 border border-white/5 hover:border-white/20 transition-colors">
                                                {t.full_name?.split(' ')[0] || 'Profesor'}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-600 text-xs italic">Sin asignar</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin/students/${student.id}/triage`}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold uppercase tracking-wide"
                                >
                                    <span className="material-symbols-outlined text-sm">monitor_heart</span>
                                    Triage
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: string, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-700">{icon}</span>
            <p className="text-sm font-bold text-gray-500">{message}</p>
        </div>
    );
}
