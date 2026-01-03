import { StandaloneDiagnosticsSection } from '@/components/dashboard/StandaloneDiagnosticsSection';
import { getStudentService } from '@/lib/infrastructure/di';
import { getStudentById } from '@/lib/data/learner';
import { cookies } from 'next/headers';

export default async function StudentMissionsPage() {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) return <div>Estudiante no identificado</div>;

    const student = await getStudentById(studentId);
    const studentService = getStudentService();
    const assignments = await studentService.getStandaloneAssignments(studentId);

    // Filter logic can be added here

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-white tracking-tight">Diagnósticos Disponibles</h1>
                <p className="text-gray-400">Completa tus evaluaciones para actualizar tu perfil de datos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reusing existing component or creating list */}
                {assignments.length > 0 ? (
                    assignments.map(a => (
                        <div key={a.assignmentId} className="p-6 rounded-3xl bg-surface/30 backdrop-blur-md border border-white/5 hover:border-primary/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">analytics</span>
                                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">{a.status === 'ASSIGNED' ? 'Asignado' : a.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completado'}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{a.examTitle}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6">{a.subject}</p>

                            <a href={`/assessment/${a.examId}`} className="block w-full py-3 bg-white text-black font-black text-center rounded-xl hover:bg-primary hover:text-white transition-colors">
                                {a.status === 'COMPLETED' ? 'VER RESULTADOS' : 'INICIAR DIAGNÓSTICO'}
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-3xl">
                        <p className="text-gray-500">No tienes misiones activas por el momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
