'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCourse, upsertLesson, deleteLesson, deleteCourse } from '@/lib/admin-actions';

interface CourseFormProps {
    course: any;
    lessons: any[];
}

export default function CourseForm({ course, lessons }: CourseFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Course state
    const [courseTitle, setCourseTitle] = useState(course?.title || '');
    const [courseDesc, setCourseDesc] = useState(course?.description || '');
    const [courseThumb, setCourseThumb] = useState(course?.thumbnail_url || '');
    const [courseCat, setCourseCat] = useState(course?.category || 'Principiante');
    const [courseLevel, setCourseLevel] = useState(course?.level_required || 1);

    // Lesson Modal/Form state (simplified in-place editor)
    const [editingLesson, setEditingLesson] = useState<any>(null);

    const handleSaveCourse = () => {
        startTransition(async () => {
            try {
                const result = await upsertCourse({
                    id: course?.id,
                    title: courseTitle,
                    description: courseDesc,
                    thumbnail_url: courseThumb,
                    category: courseCat,
                    level_required: courseLevel
                });
                if (!course?.id) {
                    router.push(`/admin/courses/${result.id}`);
                }
                alert('Misión guardada correctamente');
            } catch (error) {
                alert('Error al guardar: ' + (error as Error).message);
            }
        });
    };

    const handleDeleteCourse = () => {
        if (!confirm('¿Seguro que quieres borrar toda esta misión y sus lecciones?')) return;
        startTransition(async () => {
            await deleteCourse(course.id);
            router.push('/admin/courses');
        });
    };

    const handleSaveLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const lessonData = {
            id: editingLesson?.id,
            course_id: course.id,
            title: formData.get('title'),
            video_url: formData.get('video_url'),
            description: formData.get('description'),
            thumbnail_url: formData.get('thumbnail_url'),
            download_url: formData.get('download_url'),
            total_steps: parseInt(formData.get('total_steps') as string),
            order: parseInt(formData.get('order') as string),
        };

        startTransition(async () => {
            try {
                await upsertLesson(lessonData);
                setEditingLesson(null);
            } catch (error) {
                alert('Error al guardar lección: ' + (error as Error).message);
            }
        });
    };

    const handleDeleteLesson = (lessonId: string) => {
        if (!confirm('¿Borrar esta lección?')) return;
        startTransition(async () => {
            await deleteLesson(lessonId, course.id);
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Course Settings */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">settings</span>
                        Ajustes de Misión
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Título</label>
                            <input
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                                className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500/50 transition-all"
                                placeholder="Ej: Fundamentos de Procreate"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Descripción</label>
                            <textarea
                                value={courseDesc}
                                onChange={(e) => setCourseDesc(e.target.value)}
                                className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500/50 transition-all min-h-[100px]"
                                placeholder="¿De qué trata esta aventura?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Categoría</label>
                                <select
                                    value={courseCat}
                                    onChange={(e) => setCourseCat(e.target.value)}
                                    className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white focus:ring-2 ring-amber-500/50 appearance-none"
                                >
                                    <option>Principiante</option>
                                    <option>Intermedio</option>
                                    <option>Avanzado</option>
                                    <option>Maestría</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Nivel Req.</label>
                                <input
                                    type="number"
                                    value={courseLevel}
                                    onChange={(e) => setCourseLevel(parseInt(e.target.value))}
                                    className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white focus:ring-2 ring-amber-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">URL de Miniatura</label>
                            <input
                                value={courseThumb}
                                onChange={(e) => setCourseThumb(e.target.value)}
                                className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white placeholder:text-gray-600 focus:ring-2 ring-amber-500/50"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleSaveCourse}
                            disabled={isPending}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-4 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        {course?.id && (
                            <button
                                onClick={handleDeleteCourse}
                                className="w-full text-red-500 hover:text-red-400 font-bold py-2 text-sm transition-colors"
                            >
                                Borrar Misión
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Lessons Manager */}
            <div className="lg:col-span-2 space-y-8">
                {!course?.id ? (
                    <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-3xl p-12 text-center">
                        <p className="text-gray-500 font-bold">Primero guarda la misión para empezar a añadir lecciones.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-500">video_library</span>
                                Lecciones ({lessons.length})
                            </h2>
                            <button
                                onClick={() => setEditingLesson({ order: lessons.length + 1, total_steps: 5 })}
                                className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all border border-white/5"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Añadir Lección
                            </button>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-4">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center font-black text-amber-500 border border-white/5 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                            {lesson.order}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{lesson.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{lesson.total_steps} Pasos Atómicos • {lesson.video_url?.substring(0, 30)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingLesson(lesson)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Lesson Editor Modal (Simplified Overlay) */}
                        {editingLesson && (
                            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                                <form
                                    onSubmit={handleSaveLesson}
                                    className="bg-neutral-900 w-full max-w-2xl rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black tracking-tighter">
                                            {editingLesson.id ? 'Editar Lección' : 'Nueva Lección'}
                                        </h3>
                                        <button type="button" onClick={() => setEditingLesson(null)} className="text-gray-500 hover:text-white">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Título de la Lección</label>
                                            <input name="title" defaultValue={editingLesson.title} required className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white" />
                                        </div>

                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">URL del Video (MP4)</label>
                                            <input name="video_url" defaultValue={editingLesson.video_url} required className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Orden</label>
                                            <input name="order" type="number" defaultValue={editingLesson.order} required className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Pasos Atómicos</label>
                                            <input name="total_steps" type="number" defaultValue={editingLesson.total_steps} required className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white" />
                                        </div>

                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">URL de Descarga (Pinceles)</label>
                                            <input name="download_url" defaultValue={editingLesson.download_url} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-white" placeholder="Opcional" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setEditingLesson(null)} className="px-6 py-3 font-bold text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-black font-black px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                                            {isPending ? 'Guardando...' : 'Guardar Lección'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
