import { getTeachers } from '@/lib/actions/admin/admin-users-actions';
import { getUserId, validateStaff, getAuthUser, getUserRole } from '@/lib/infrastructure/auth-utils';
import { CreateStudentForm } from '@/components/admin/UserManagementForms';
import { StudentListTable } from '@/components/admin/UserTables';
import { getTeacherService } from '@/lib/infrastructure/di';

export default async function TeacherStudentsPage() {
    // 1. Validar Acceso
    await validateStaff();
    const user = await getAuthUser();
    const userId = user?.id;
    const role = await getUserRole();

    if (!userId || !user) return <div>No autorizado</div>;

    // 2. Obtener Datos (Cohorte del Profesor)
    const service = getTeacherService();

    // Obtener perfil del profesor incluyendo sus estudiantes
    // Nota: Usamos 'getTeacherById' porque ya resuelve la relación M:N
    const teacherProfile = await service.getTeacherById(userId, 'teacher');

    // Mapear estudiantes para que coincidan con la interfaz de la tabla
    // El repositorio devuelve la estructura, pero aseguramos que el campo 'teachers' exista
    const rawStudents = teacherProfile?.students || [];
    const students = rawStudents.map((s: any) => ({
        ...s,
        // Si ya trae teachers, usarlos. Si no, poner al profesor actual como asignado visualmente.
        teachers: s.teachers || [{
            id: userId,
            full_name: user.user_metadata?.full_name || 'Yo',
            email: user.email
        }]
    }));

    // 3. Preparar lista de profesores para el formulario (si es admin)
    let teachers = [];
    if (role === 'admin') {
        const allTeachers = await service.getTeachers(role);
        teachers = allTeachers || [];
    } else {
        // Self-assign for instructor/teacher
        teachers = [{
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null
        }];
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="flex items-center justify-between pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Gestión de Cohorte</h1>
                    <p className="text-gray-400 mt-2">Administra el acceso y asignaciones de tus estudiantes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                        {role === 'admin' ? 'Modo Administrador' : 'Modo Instructor'}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
                        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
                            <CreateStudentForm teachers={teachers} isAdmin={role === 'admin'} />
                        </div>
                    </div>
                </div>

                {/* Right: Data View */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1F1F1F] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-500">groups</span>
                                Estudiantes Activos
                            </h3>
                            <span className="text-xs text-gray-500">{students.length} registros</span>
                        </div>
                        <StudentListTable students={students} />
                    </div>
                </div>
            </div>
        </div>
    );
}
