'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    upsertCourse,
    upsertLesson,
    deleteLesson,
    deleteCourse,
    ActionResponse
} from '@/lib/admin-content-actions';
import ResourceUploader from '@/components/admin/ResourceUploader';
import StepEditor from '@/components/admin/StepEditor';

import { Course, Lesson } from '@/lib/domain/course';

interface CourseFormProps {
    course: Course | null;
    lessons: Lesson[];
}

export default function CourseForm({ course, lessons: initialLessons }: CourseFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<'general' | 'curriculum'>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Course state
    const [courseData, setCourseData] = useState({
        id: course?.id,
        title: course?.title || '',
        description: course?.description || '',
        thumbnail_url: course?.thumbnail_url || '',
        category: course?.category || 'Principiante',
        level_required: course?.level_required || 1,
        is_published: course?.is_published || false
    });

    // Curriculum (Lessons) state
    const [lessons, setLessons] = useState(initialLessons);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [lessonFormData, setLessonFormData] = useState<any>(null);

    useEffect(() => {
        setLessons(initialLessons);
    }, [initialLessons]);

    useEffect(() => {
        if (selectedLessonId) {
            const lesson = lessons.find(l => l.id === selectedLessonId);
            setLessonFormData(lesson ? { ...lesson } : null);
        } else {
            setLessonFormData(null);
        }
    }, [selectedLessonId, lessons]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSaveCourse = async () => {
        startTransition(async () => {
            const result = await upsertCourse(courseData);
            if (result.success) {
                showMessage('success', 'Misión guardada con éxito');
                if (!course?.id) {
                    router.push(`/admin/courses/${result.data.id}`);
                }
            } else {
                showMessage('error', result.error);
            }
        });
    };

    const handleSaveLesson = async () => {
        if (!lessonFormData) return;
        startTransition(async () => {
            const payload = { ...lessonFormData, course_id: course?.id };
            const result = await upsertLesson(payload);
            if (result.success) {
                showMessage('success', 'Fase de misión sincronizada');
                // Actualización local para UX instantánea si es edición
                if (lessonFormData.id) {
                    setLessons(prev => prev.map(l => l.id === result.data.id ? result.data : l));
                }
            } else {
                showMessage('error', result.error);
            }
        });
    };

    const handleCreateNewLesson = () => {
        const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1;
        setSelectedLessonId('new');
        setLessonFormData({
            title: '',
            video_url: '',
            order: nextOrder,
            total_steps: 5,
            description: '',
            thumbnail_url: '',
            download_url: ''
        });
    };

    const handleDeleteLesson = (lessonId: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta fase?')) return;
        startTransition(async () => {
            const result = await deleteLesson(lessonId, course?.id || '');
            if (result.success) {
                showMessage('success', 'Fase eliminada');
                setLessons(prev => prev.filter(l => l.id !== lessonId));
                if (selectedLessonId === lessonId) setSelectedLessonId(null);
            } else {
                showMessage('error', result.error);
            }
        });
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Feedback Toast */}
            {message && (
                <div className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                </div>
            )}

            {/* Sticky Command Header */}
            <div className="sticky top-24 z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${courseData.is_published ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-gray-500'
                        }`}>
                        <span className="material-symbols-outlined font-black">
                            {courseData.is_published ? 'rocket_launch' : 'drafts'}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white leading-none mb-1">
                            {courseData.title || 'Nueva Misión'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {courseData.is_published ? 'Operación Activa' : 'Fase de Preparación'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: false })}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!courseData.is_published ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                        >
                            BORRADOR
                        </button>
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: true })}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${courseData.is_published ? 'bg-amber-500 text-black' : 'text-gray-500'}`}
                        >
                            PUBLICAR
                        </button>
                    </div>
                    <button
                        onClick={handleSaveCourse}
                        disabled={isPending}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black px-6 py-3 rounded-xl text-xs transition-all flex items-center gap-2 group shadow-xl active:scale-95"
                    >
                        {isPending ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm group-hover:-translate-y-0.5 transition-transform">auto_awesome</span>}
                        GUARDAR MISIÓN
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-surface/50 border border-white/5 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'general' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">settings_input_component</span>
                    CONFIGURACIÓN
                </button>
                <button
                    onClick={() => setActiveTab('curriculum')}
                    disabled={!course?.id}
                    className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'curriculum' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white disabled:opacity-30'}`}
                >
                    <span className="material-symbols-outlined text-sm">architecture</span>
                    PLAN DE ESTUDIOS
                </button>
            </div>

            {/* Tab: General Settings */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-surface/30 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detalles de la Misión</label>
                                <input
                                    value={courseData.title}
                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-xl font-bold text-white placeholder:text-gray-700 focus:ring-2 ring-amber-500 transition-all outline-none"
                                    placeholder="Nombre de la aventura..."
                                />
                                <textarea
                                    value={courseData.description}
                                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white placeholder:text-gray-700 focus:ring-2 ring-amber-500 transition-all min-h-[160px] outline-none leading-relaxed"
                                    placeholder="Describe el reto creativo..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría</label>
                                    <select
                                        value={courseData.category}
                                        onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                                        className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white font-bold focus:ring-2 ring-amber-500 appearance-none outline-none"
                                    >
                                        <option>Principiante</option>
                                        <option>Intermedio</option>
                                        <option>Avanzado</option>
                                        <option>Maestría</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nivel Requerido</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={courseData.level_required}
                                        onChange={(e) => setCourseData({ ...courseData, level_required: parseInt(e.target.value) })}
                                        className="w-full bg-[#252525] border border-white/5 rounded-2xl p-5 text-white font-bold focus:ring-2 ring-amber-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {course?.id && (
                            <div className="p-8 border border-red-500/10 rounded-[2.5rem] bg-red-500/[0.02] flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-red-400">Zona de Riesgo</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Esta acción eliminará la misión y todas sus fases permanentemente.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('¿Confirmas la destrucción de esta misión?')) {
                                            startTransition(async () => {
                                                await deleteCourse(course.id);
                                                router.push('/admin/courses');
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 text-[10px] font-black text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"
                                >
                                    DESTRUIR MISIÓN
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-surface/30 border border-white/5 rounded-[2.5rem] p-6">
                            <ResourceUploader
                                folder="course-thumbnails"
                                accept="image/*"
                                initialUrl={courseData.thumbnail_url}
                                label="Portada de la Misión"
                                onUploadComplete={(url) => setCourseData({ ...courseData, thumbnail_url: url })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Curriculum Master-Detail */}
            {activeTab === 'curriculum' && (
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 h-[calc(100vh-320px)] animate-in fade-in duration-500">
                    {/* Master: Lessons List */}
                    <div className="flex flex-col gap-4 bg-surface/30 border border-white/5 rounded-[2.5rem] p-4 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fases de la Misión</h3>
                            <button
                                onClick={handleCreateNewLesson}
                                className="size-8 rounded-lg bg-amber-500 text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all font-black"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {lessons.length === 0 ? (
                                <div className="text-center py-12 px-4 border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest italic">Abre el estudio...</p>
                                </div>
                            ) : (
                                lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setSelectedLessonId(lesson.id)}
                                        className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${selectedLessonId === lesson.id
                                            ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                                            : 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm italic ${selectedLessonId === lesson.id ? 'bg-black/10 text-black' : 'bg-neutral-800 text-amber-500'
                                            }`}>
                                            {lesson.order}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black truncate uppercase tracking-tight">{lesson.title}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedLessonId === lesson.id ? 'text-black/60' : 'text-gray-500'}`}>
                                                {lesson.total_steps} Pasos • {lesson.download_url ? 'Recursos' : 'Sin recursos'}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detail: Lesson Editor */}
                    <div className="bg-surface/30 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col relative">
                        {lessonFormData ? (
                            <div className="flex flex-col h-full animate-in slide-in-from-bottom duration-500">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-amber-500">architecture</span>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                                            {lessonFormData.id ? `Refinar Fase ${lessonFormData.order}` : 'Nueva Fase Atómica'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {lessonFormData.id && (
                                            <button
                                                onClick={() => handleDeleteLesson(lessonFormData.id)}
                                                className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSaveLesson}
                                            className="bg-amber-500 hover:bg-amber-600 text-black font-black px-6 py-2.5 rounded-xl text-[10px] tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-sm">save</span>
                                            SINCRONIZAR
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título de la Fase</label>
                                                <input
                                                    value={lessonFormData.title}
                                                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 text-lg font-bold text-white focus:ring-2 ring-amber-500 outline-none transition-all"
                                                    placeholder="Ej: El Esqueleto de la Obra"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">URL del Master Class</label>
                                                <div className="relative group">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-amber-500 transition-colors">play_circle</span>
                                                    <input
                                                        value={lessonFormData.video_url}
                                                        onChange={(e) => setLessonFormData({ ...lessonFormData, video_url: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 pl-14 text-white font-mono text-xs focus:ring-2 ring-amber-500 outline-none"
                                                        placeholder="https://video-cdn.com/..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Orden de Secuencia</label>
                                                    <input
                                                        type="number"
                                                        value={lessonFormData.order}
                                                        onChange={(e) => setLessonFormData({ ...lessonFormData, order: parseInt(e.target.value) })}
                                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 text-white font-bold text-center focus:ring-2 ring-amber-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Thumbnail (Opcional)</label>
                                                    <ResourceUploader
                                                        label=""
                                                        folder="lesson-thumbs"
                                                        accept="image/*"
                                                        initialUrl={lessonFormData.thumbnail_url}
                                                        onUploadComplete={(url) => setLessonFormData({ ...lessonFormData, thumbnail_url: url })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            <StepEditor
                                                value={lessonFormData.total_steps}
                                                onChange={(val) => setLessonFormData({ ...lessonFormData, total_steps: val })}
                                            />

                                            <ResourceUploader
                                                label="Caja de Herramientas (.brushset / .pdf)"
                                                folder="lesson-resources"
                                                accept=".brushset,.pdf,.procreate,.zip"
                                                initialUrl={lessonFormData.download_url}
                                                onUploadComplete={(url) => setLessonFormData({ ...lessonFormData, download_url: url })}
                                            />

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instrucciones DX</label>
                                                <textarea
                                                    value={lessonFormData.description}
                                                    onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 text-white text-sm focus:ring-2 ring-amber-500 outline-none transition-all min-h-[120px]"
                                                    placeholder="Escribe aquí los objetivos técnicos de esta fase..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                <div className="size-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-gray-700 animate-pulse">
                                    <span className="material-symbols-outlined text-5xl">stylus_note</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-gray-500">Selecciona una fase para editar</h4>
                                    <p className="text-xs text-gray-600 max-w-xs mx-auto">Configura los videos, pinceles y complejidad LEGO de cada etapa de la misión.</p>
                                </div>
                                <button
                                    onClick={handleCreateNewLesson}
                                    className="bg-white/5 hover:bg-white/10 text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-white/10"
                                >
                                    O Crear Nueva Fase Ahora
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
