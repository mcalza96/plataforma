import { getTeachers, getStudents } from '@/lib/actions/admin/admin-users-actions';
import { CreateTeacherForm, CreateStudentForm } from '@/components/admin/UserManagementForms';
import { TeacherListTable, StudentListTable } from '@/components/admin/UserTables';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

export default async function AdminUsersPage() {
    // Parallel data fetching for Admin View
    const [teachers, students] = await Promise.all([
        getTeachers(),
        getStudents()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm shadow-2xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Centro de Comando</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">Gestión de Identidades</h1>
                    <p className="text-gray-400 text-sm max-w-md">Administración de flota de docentes y despliegue de aprendices.</p>
                </div>

                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Docentes Activos</p>
                        <p className="text-xl font-black text-amber-500">{teachers.length}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Aprendices</p>
                        <p className="text-xl font-black text-blue-500">
                            {students.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Tabs Interface */}
            <Tabs defaultValue="teachers" className="space-y-6">
                <TabsList className="bg-surface/40 p-1 rounded-xl border border-white/5 w-fit flex gap-1">
                    <TabsTrigger
                        value="teachers"
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all hover:text-white"
                    >
                        Gestión de Profesores
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-black transition-all hover:text-white"
                    >
                        Directorio de Estudiantes
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Teachers */}
                <TabsContent value="teachers" className="space-y-6 focus:outline-none animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <CreateTeacherForm />
                        </div>
                        <div className="lg:col-span-3">
                            <TeacherListTable teachers={teachers} />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Students */}
                <TabsContent value="students" className="space-y-6 focus:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <CreateStudentForm teachers={teachers} isAdmin={true} />
                        </div>
                        <div className="lg:col-span-3">
                            <StudentListTable students={students} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
