'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    upsertCourse,
    upsertLesson,
    deleteCourse,
} from '@/lib/admin-content-actions';
import ResourceUploader from '@/components/admin/ResourceUploader';
import { Course, Lesson } from '@/lib/domain/course';
import { PhaseCard } from './PhaseCard';

interface CourseFormProps {
    course: Course | null;
    lessons: Lesson[];
}

/**
 * CourseForm: Now acts as a "Command Center" (SRP).
 * Manages only high-level mission metadata and the sequence of phases.
 */
export default function CourseForm({ course, lessons: initialLessons }: CourseFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<'general' | 'curriculum'>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [courseData, setCourseData] = useState({
        id: course?.id,
        title: course?.title || '',
        description: course?.description || '',
        thumbnail_url: course?.thumbnail_url || '',
        category: course?.category || 'Principiante',
        level_required: course?.level_required || 1,
        is_published: course?.is_published || false
    });

    const [lessons, setLessons] = useState(initialLessons);

    useEffect(() => {
        setLessons(initialLessons);
    }, [initialLessons]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSaveCourse = async () => {
        startTransition(async () => {
            const result = await upsertCourse(courseData);
            if (result.success) {
                showMessage('success', 'Misión sincronizada en el sistema');
                if (!course?.id) {
                    router.push(`/admin/courses/${result.data.id}`);
                }
            } else {
                showMessage('error', result.error);
            }
        });
    };

    /**
     * OCP: Business logic for fast creation. 
     * Decouples creation from full detailed editing.
     */
    const handleQuickCreatePhase = async () => {
        const title = window.prompt('¿Cuál es el nombre de esta nueva fase de aprendizaje?');
        if (!title || !course?.id) return;

        startTransition(async () => {
            const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1;
            const payload = {
                title,
                course_id: course.id,
                order: nextOrder,
                total_steps: 3, // LEGO Skeleton steps
                video_url: '',
                description: 'Nueva fase por configurar...',
                thumbnail_url: '',
                download_url: ''
            };

            const result = await upsertLesson(payload);
            if (result.success) {
                showMessage('success', 'Nueva fase atómica creada');
                router.push(`/admin/courses/${course.id}/phases/${result.data.id}`);
            } else {
                showMessage('error', result.error);
            }
        });
    };

    return (
        <div className="space-y-12 pb-24 relative bg-[#1A1A1A] text-white min-h-screen">
            {/* Feedback Notification */}
            {message && (
                <div className={`fixed top-24 right-8 z-[200] px-8 py-5 rounded-[2rem] shadow-2xl border backdrop-blur-3xl flex items-center gap-4 animate-in fade-in-0 slide-in-from-right-10 duration-500 ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <span className="material-symbols-outlined !text-xl">{message.type === 'success' ? 'verified_user' : 'report'}</span>
                    <span className="font-black text-xs uppercase tracking-[0.2em]">{message.text}</span>
                </div>
            )}

            {/* Strategic Command Header (Sticky) */}
            <div className="sticky top-24 z-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#1A1A1A]/90 backdrop-blur-md border border-white/5 p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-8">
                    <div className={`size-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-700 ${courseData.is_published
                            ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 text-gray-500 border border-white/5'
                        }`}>
                        <span className="material-symbols-outlined !text-4xl font-black">
                            {courseData.is_published ? 'rocket_launch' : 'architecture'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mb-2 px-1">Control de Operaciones</p>
                        <h1 className="text-3xl font-black tracking-tighter text-white leading-none uppercase italic">
                            {courseData.title || 'Misión sin nombre'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex bg-neutral-900 border border-white/5 p-1.5 rounded-[1.5rem] shadow-inner">
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: false })}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all tracking-[0.2em] uppercase ${!courseData.is_published ? 'bg-white/10 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            Draft
                        </button>
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: true })}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all tracking-[0.2em] uppercase ${courseData.is_published ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            Active
                        </button>
                    </div>
                    <button
                        onClick={handleSaveCourse}
                        disabled={isPending}
                        className="bg-white text-black hover:bg-amber-500 transition-all disabled:opacity-50 font-black px-10 py-5 rounded-[1.5rem] text-[10px] tracking-[0.3em] flex items-center gap-4 shadow-2xl active:scale-95 group border border-transparent hover:border-amber-500/50"
                    >
                        {isPending ? <span className="material-symbols-outlined animate-spin text-sm">settings_backup_restore</span> : <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-700">terminal</span>}
                        SINCRONIZAR MISIÓN
                    </button>
                </div>
            </div>

            {/* Tactical Switcher */}
            <div className="flex items-center gap-3 bg-[#1F1F1F] border border-white/5 p-2 rounded-[2.5rem] w-fit shadow-xl mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-12 py-5 rounded-[2rem] text-[11px] font-black tracking-[0.2em] transition-all flex items-center gap-3 border ${activeTab === 'general'
                            ? 'bg-white/5 border-white/10 text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)]'
                            : 'border-transparent text-gray-500 hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined !text-[20px]">tune</span>
                    ESTRATEGIA
                </button>
                <button
                    onClick={() => setActiveTab('curriculum')}
                    disabled={!course?.id}
                    className={`px-12 py-5 rounded-[2rem] text-[11px] font-black tracking-[0.2em] transition-all flex items-center gap-3 border ${activeTab === 'curriculum'
                            ? 'bg-white/5 border-white/10 text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)]'
                            : 'border-transparent text-gray-500 hover:text-white disabled:opacity-10'
                        }`}
                >
                    <span className="material-symbols-outlined !text-[20px]">account_tree</span>
                    CURRÍCULUM
                </button>
            </div>

            {/* Content Area Rendering */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {activeTab === 'general' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3.5rem] p-12 space-y-10 shadow-2xl shadow-black/50">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-2">Título de la Operación</label>
                                    <input
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                        className="w-full bg-neutral-900 border border-white/5 rounded-[2rem] p-8 text-3xl font-black text-white placeholder:text-gray-800 focus:ring-4 ring-amber-500/20 transition-all outline-none shadow-inner"
                                        placeholder="Nombre código de la misión..."
                                    />
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-2">Briefing Estratégico</label>
                                        <textarea
                                            value={courseData.description}
                                            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                            className="w-full bg-neutral-900 border border-white/5 rounded-[2rem] p-8 text-white placeholder:text-gray-800 focus:ring-4 ring-amber-500/20 transition-all min-h-[250px] outline-none leading-relaxed text-lg font-medium shadow-inner"
                                            placeholder="Detalla los objetivos y el contexto de esta aventura..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-2">Grado de Dificultad</label>
                                        <select
                                            value={courseData.category}
                                            onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                                            className="w-full bg-neutral-900 border border-white/5 rounded-[1.8rem] p-8 text-white font-black text-sm focus:ring-4 ring-amber-500/20 appearance-none outline-none shadow-inner cursor-pointer"
                                        >
                                            <option>Principiante</option>
                                            <option>Intermedio</option>
                                            <option>Avanzado</option>
                                            <option>Maestría</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] ml-2">Nivel Usuario Requerido</label>
                                        <div className="flex items-center bg-neutral-900 border border-white/5 rounded-[1.8rem] px-8 py-2 shadow-inner">
                                            <span className="text-gray-700 font-black text-xl italic mr-4">LVL.</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={courseData.level_required}
                                                onChange={(e) => setCourseData({ ...courseData, level_required: parseInt(e.target.value) })}
                                                className="w-full bg-transparent p-6 text-white font-black text-3xl text-center outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {course?.id && (
                                <div className="p-10 border border-red-500/20 rounded-[3rem] bg-red-500/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 group overflow-hidden relative shadow-xl shadow-red-500/5">
                                    <div className="absolute inset-0 bg-red-500/[0.05] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                    <div className="space-y-2 relative z-10">
                                        <p className="text-[11px] font-black text-red-400 uppercase tracking-[0.3em]">Protocolo de Eliminación</p>
                                        <p className="text-xs text-red-400/50 font-bold max-w-sm">Esta acción purgará la misión y todas sus fases del sistema. No hay vuelta atrás.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Confirmas la destrucción total de esta misión?')) {
                                                startTransition(async () => {
                                                    await deleteCourse(course.id);
                                                    router.push('/admin/courses');
                                                });
                                            }
                                        }}
                                        className="relative z-10 px-10 py-5 text-[10px] font-black text-white bg-red-500/10 hover:bg-red-500 rounded-2xl transition-all shadow-xl border border-red-500/20"
                                    >
                                        ELIMINAR PERMANENTEMENTE
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-10">
                            <div className="bg-[#1F1F1F] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-black/50">
                                <ResourceUploader
                                    folder="course-thumbnails"
                                    accept="image/*"
                                    initialUrl={courseData.thumbnail_url}
                                    label="Iconografía de Misión"
                                    onUploadComplete={(url) => setCourseData({ ...courseData, thumbnail_url: url })}
                                />
                                <div className="mt-10 p-8 bg-neutral-900/50 rounded-[2rem] border border-white/5 space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Checklist de Calidad</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-amber-500/50">check_circle</span>
                                            Miniatura temática cargada
                                        </li>
                                        <li className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-amber-500/50">check_circle</span>
                                            Briefing detallado (+20 caracteres)
                                        </li>
                                        <li className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <span className="material-symbols-outlined !text-lg text-amber-500/50">check_circle</span>
                                            Nivel de dificultad asignado
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
                            <div className="space-y-3">
                                <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Mapa del Plan de Estudios</h3>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Secuencia lógica de fases para dominar la misión.</p>
                            </div>
                            <button
                                onClick={handleQuickCreatePhase}
                                disabled={isPending}
                                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black font-black px-12 py-6 rounded-[2rem] text-[11px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined !text-2xl font-black">add_circle</span>
                                DESPLEGAR FASE
                            </button>
                        </div>

                        <div className="space-y-6">
                            {lessons.length === 0 ? (
                                <div className="py-32 px-10 border-2 border-dashed border-white/5 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-8 bg-white/[0.01]">
                                    <div className="size-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white/20">
                                        <span className="material-symbols-outlined !text-5xl font-light">inventory_2</span>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-2xl font-black text-gray-600 uppercase tracking-tighter italic">Parrilla de contenido vacía</p>
                                        <p className="text-xs text-gray-700 max-w-xs mx-auto font-black uppercase tracking-widest leading-loose">Todavía no has desplegado ninguna fase. Es momento de empezar a construir la ruta del alumno.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {lessons
                                        .sort((a, b) => a.order - b.order)
                                        .map((lesson) => (
                                            <PhaseCard
                                                key={lesson.id}
                                                lesson={lesson}
                                                courseId={course?.id || ''}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
