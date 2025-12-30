'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    upsertCourse,
    upsertLesson,
    deleteCourse,
} from '@/lib/admin-content-actions';
import ResourceUploader from '@/components/admin/ResourceUploader';
import { Course, Lesson } from '@/lib/domain/course';

interface CourseFormProps {
    course: Course | null;
    lessons: Lesson[];
}

/**
 * SRP: PhaseCard only handles displaying a summary of a mission phase (lesson)
 * and providing navigation to its own editor.
 */
function PhaseCard({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
    return (
        <div className="group bg-[#252525] border border-white/5 p-6 rounded-[2.5rem] hover:border-amber-500/50 transition-all flex items-center justify-between shadow-2xl overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform blur-2xl" />

            <div className="flex items-center gap-8 relative z-10">
                <div className="size-16 rounded-[1.5rem] bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-2xl italic text-amber-500 shadow-xl group-hover:scale-105 transition-transform">
                    {lesson.order}
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        {lesson.title || 'Fase sin título'}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <span className="material-symbols-outlined text-[14px] text-gray-500">grid_view</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lesson.total_steps || 0} Pasos Atómicos</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${lesson.video_url ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            <span className="material-symbols-outlined text-[14px]">{lesson.video_url ? 'play_circle' : 'pending'}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{lesson.video_url ? 'Activo' : 'Borrador'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <Link
                    href={`/admin/courses/${courseId}/phases/${lesson.id}`}
                    className="flex items-center gap-2 bg-white/5 hover:bg-amber-500 hover:text-black py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg group/btn active:scale-95 border border-white/5"
                >
                    <span>Refinar Fase</span>
                    <span className="material-symbols-outlined !text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
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
                total_steps: 5, // Default LEGO skeleton
                video_url: '',
                description: '',
                thumbnail_url: '',
                download_url: ''
            };

            const result = await upsertLesson(payload);
            if (result.success) {
                showMessage('success', 'Nueva fase atómica creada');
                router.refresh(); // Update the list
            } else {
                showMessage('error', result.error);
            }
        });
    };

    return (
        <div className="space-y-8 pb-24 relative">
            {/* Feedback Notification */}
            {message && (
                <div className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <span className="material-symbols-outlined">{message.type === 'success' ? 'verified_user' : 'report'}</span>
                    <span className="font-black text-xs uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            {/* Strategic Header */}
            <div className="sticky top-24 z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className={`size-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${courseData.is_published ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/30' : 'bg-white/5 text-gray-500'
                        }`}>
                        <span className="material-symbols-outlined !text-3xl font-black">
                            {courseData.is_published ? 'rocket_launch' : 'architecture'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">Centro de Misión</p>
                        <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
                            {courseData.title || 'Iniciando Aventura...'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: false })}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all tracking-widest uppercase ${!courseData.is_published ? 'bg-white/10 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            Draft
                        </button>
                        <button
                            onClick={() => setCourseData({ ...courseData, is_published: true })}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all tracking-widest uppercase ${courseData.is_published ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            Active
                        </button>
                    </div>
                    <button
                        onClick={handleSaveCourse}
                        disabled={isPending}
                        className="bg-white text-black hover:bg-amber-500 transition-all disabled:opacity-50 font-black px-8 py-4 rounded-2xl text-[10px] tracking-[0.2em] flex items-center gap-3 shadow-2xl active:scale-95 group"
                    >
                        {isPending ? <span className="material-symbols-outlined animate-spin text-sm">settings_backup_restore</span> : <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-500">terminal</span>}
                        SINCRONIZAR CAMBIOS
                    </button>
                </div>
            </div>

            {/* Tactical Navigation */}
            <div className="flex items-center gap-2 bg-[#1A1A1A]/50 border border-white/5 p-2 rounded-[2rem] w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-10 py-4 rounded-2xl text-[10px] font-black tracking-[0.1em] transition-all flex items-center gap-2 border ${activeTab === 'general' ? 'bg-white/10 border-white/10 text-white shadow-2xl' : 'border-transparent text-gray-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    ESTRATEGIA GENERAL
                </button>
                <button
                    onClick={() => setActiveTab('curriculum')}
                    disabled={!course?.id}
                    className={`px-10 py-4 rounded-2xl text-[10px] font-black tracking-[0.1em] transition-all flex items-center gap-2 border ${activeTab === 'curriculum' ? 'bg-white/10 border-white/10 text-white shadow-2xl' : 'border-transparent text-gray-500 hover:text-white disabled:opacity-20'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">account_tree</span>
                    MAPA DE MISIÓN
                </button>
            </div>

            {/* Tab: General Strategy */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Título de la Operación</label>
                                <input
                                    value={courseData.title}
                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-2xl font-black text-white placeholder:text-gray-800 focus:ring-2 ring-amber-500 transition-all outline-none shadow-inner"
                                    placeholder="Nombre de la aventura..."
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Briefing Creativo</label>
                                    <textarea
                                        value={courseData.description}
                                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                        className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white placeholder:text-gray-800 focus:ring-2 ring-amber-500 transition-all min-h-[200px] outline-none leading-relaxed font-medium shadow-inner"
                                        placeholder="Define los objetivos estratégicos y el lore de esta misión..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Clasificación</label>
                                    <select
                                        value={courseData.category}
                                        onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                                        className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white font-black text-sm focus:ring-2 ring-amber-500 appearance-none outline-none shadow-inner"
                                    >
                                        <option>Principiante</option>
                                        <option>Intermedio</option>
                                        <option>Avanzado</option>
                                        <option>Maestría</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Nivel Delta Requerido</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={courseData.level_required}
                                        onChange={(e) => setCourseData({ ...courseData, level_required: parseInt(e.target.value) })}
                                        className="w-full bg-neutral-900/50 border border-white/5 rounded-[1.5rem] p-6 text-white font-black text-lg text-center focus:ring-2 ring-amber-500 outline-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {course?.id && (
                            <div className="p-8 border border-red-500/10 rounded-[3rem] bg-red-500/[0.02] flex items-center justify-between group overflow-hidden relative">
                                <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <div className="space-y-1 relative z-10">
                                    <p className="text-sm font-black text-red-400 uppercase tracking-widest">Protocolo de Autodestrucción</p>
                                    <p className="text-[10px] text-gray-600 font-bold">Esta acción purgará la misión y todas sus fases del servidor permanentemente.</p>
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
                                    className="relative z-10 px-8 py-4 text-[10px] font-black text-white bg-red-500/10 hover:bg-red-500 rounded-2xl transition-all shadow-xl border border-red-500/20"
                                >
                                    ABORTAR MISIÓN
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#1F1F1F] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
                            <ResourceUploader
                                folder="course-thumbnails"
                                accept="image/*"
                                initialUrl={courseData.thumbnail_url}
                                label="Identificador Visual de Misión"
                                onUploadComplete={(url) => setCourseData({ ...courseData, thumbnail_url: url })}
                            />
                            <div className="mt-8 p-6 bg-neutral-900/50 rounded-[1.5rem] border border-white/5">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Requerimientos de Sistema</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Miniatura 4:3 optimizada
                                    </li>
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Descripción estratégica (+20 chars)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Mission Map (Curriculum) */}
            {activeTab === 'curriculum' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Mapa de Despliegue</h3>
                            <p className="text-xs text-gray-500 font-medium">Secuencia cronológica de fases de aprendizaje.</p>
                        </div>
                        <button
                            onClick={handleQuickCreatePhase}
                            disabled={isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-black px-8 py-4 rounded-2xl text-[10px] tracking-widest uppercase transition-all flex items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined font-black">add_circle</span>
                            DESPLEGAR NUEVA FASE
                        </button>
                    </div>

                    <div className="space-y-4 max-w-5xl">
                        {lessons.length === 0 ? (
                            <div className="py-24 px-8 border-2 border-dashed border-white/5 rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6 bg-white/[0.01]">
                                <div className="size-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-800">
                                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-black text-gray-600 uppercase tracking-widest italic">El hangar está vacío</p>
                                    <p className="text-xs text-gray-700 max-w-xs mx-auto font-medium">No se han registrado fases atómicas para esta misión. Presiona el botón superior para iniciar el despliegue.</p>
                                </div>
                            </div>
                        ) : (
                            lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson) => (
                                    <PhaseCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        courseId={course?.id || ''}
                                    />
                                ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
