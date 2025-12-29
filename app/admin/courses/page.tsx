import { getCourseService } from '@/lib/di';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

export default async function AdminCoursesPage() {
    const service = getCourseService();
    const courses = await service.getAllCourses();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Gestión de Cursos</h1>
                    <p className="text-gray-400">Administra las misiones y desafíos de la academia.</p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nueva Misión
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {courses?.map((course) => (
                    <div key={course.id} className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-6 flex-1">
                            <div
                                className="w-24 h-16 bg-cover bg-center rounded-lg border border-white/10 shrink-0"
                                style={{ backgroundImage: course.thumbnail_url ? `url(${course.thumbnail_url})` : 'none', backgroundColor: '#333' }}
                            />
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-1">{course.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">{course.category || 'Sin Categoría'}</span>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-xs text-gray-500">Requisito: Nivel {course.level_required}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={`/admin/courses/${course.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-300 font-bold text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Editar
                            </Link>
                            <Link
                                href={`/lessons/${course.id}`}
                                target="_blank"
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                                title="Ver como Alumno"
                            >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </Link>
                        </div>
                    </div>
                ))}

                {(!courses || courses.length === 0) && (
                    <EmptyState
                        icon="school"
                        title="Tu academia está vacía"
                        description="Crea tu primer curso para que los alumnos puedan empezar a aprender."
                        actionLabel="Nueva Misión"
                        actionHref="/admin/courses/new"
                    />
                )}
            </div>
        </div>
    );
}
