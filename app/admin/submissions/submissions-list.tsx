'use client';

import { useState, useTransition } from 'react';
import { sendFeedback } from '@/lib/admin-actions';
import Image from 'next/image';

export default function SubmissionsList({ initialSubmissions }: { initialSubmissions: any[] }) {
    const [submissions] = useState(initialSubmissions);
    const [isPending, startTransition] = useTransition();
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [feedbackContent, setFeedbackContent] = useState('');

    const handleSendFeedback = () => {
        if (!feedbackContent.trim()) return;
        startTransition(async () => {
            try {
                await sendFeedback(selectedSubmission.learner_id, feedbackContent);
                alert('¡Feedback enviado con éxito! El alumno recibirá una notificación.');
                setFeedbackContent('');
                setSelectedSubmission(null);
            } catch (error) {
                alert('Error al enviar feedback: ' + (error as Error).message);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* List of Submissions */}
            <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {submissions.length === 0 ? (
                    <div className="text-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-gray-500 text-sm italic">Aún no hay entregas.</p>
                    </div>
                ) : submissions.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => {
                            setSelectedSubmission(sub);
                            setFeedbackContent('');
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${selectedSubmission?.id === sub.id
                                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden shrink-0 border border-white/10">
                                {sub.learners?.avatar_url && (
                                    <Image
                                        src={sub.learners.avatar_url}
                                        alt={sub.learners.display_name}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className={`font-bold transition-colors truncate ${selectedSubmission?.id === sub.id ? 'text-amber-500' : 'text-white'}`}>
                                    {sub.learners?.display_name}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">{new Date(sub.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-400 font-medium line-clamp-1 group-hover:text-gray-300">
                            {sub.title}
                        </p>
                    </button>
                ))}
            </div>

            {/* Viewer/Review Area */}
            <div className="lg:col-span-3">
                {selectedSubmission ? (
                    <div className="bg-[#1F1F1F] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Video Player */}
                        <div className="aspect-video bg-black relative group/player">
                            <video
                                key={selectedSubmission.id}
                                src={selectedSubmission.file_url}
                                className="w-full h-full"
                                controls
                                autoPlay
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Revisión de Obra
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none mb-2">
                                        {selectedSubmission.title}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-amber-500">history_edu</span>
                                            {selectedSubmission.lessons?.title || 'Entrega General'}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                        <span>Subido por <b className="text-gray-300">{selectedSubmission.learners?.display_name}</b></span>
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-2xl px-5 py-3 border border-white/5">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Categoría</p>
                                    <p className="text-white font-bold">{selectedSubmission.category || 'Time-lapse'}</p>
                                </div>
                            </div>

                            {/* Feedback Form */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                                    <span className="material-symbols-outlined text-amber-500">chat_bubble</span>
                                    Enviar Feedback Técnico y Motivador
                                </h3>
                                <div className="relative">
                                    <textarea
                                        value={feedbackContent}
                                        onChange={(e) => setFeedbackContent(e.target.value)}
                                        placeholder="Ej: '¡Me encantan las sombres que lograste con el pincel de carboncillo! Intenta que los bordes sean más suaves en la próxima...'"
                                        className="w-full bg-neutral-900 border-2 border-white/5 rounded-2xl p-6 text-white placeholder:text-gray-600 focus:ring-4 ring-amber-500/10 focus:border-amber-500/50 min-h-[160px] transition-all text-lg leading-relaxed"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                        Mensaje para Alumno y Padres
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSendFeedback}
                                        disabled={isPending || !feedbackContent.trim()}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-4 px-10 rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-3 min-w-[240px] justify-center"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                        {isPending ? 'ENVIANDO...' : 'ENVIAR FEEDBACK'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 bg-white/[0.01] rounded-3xl flex flex-col items-center justify-center text-center p-12">
                        <div className="w-24 h-24 bg-neutral-800/50 rounded-3xl flex items-center justify-center mb-8 text-gray-700 shadow-inner">
                            <span className="material-symbols-outlined text-6xl">movie_filter</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 tracking-tight">Selecciona una obra para revisar</h3>
                        <p className="text-gray-600 max-w-xs mt-3 text-lg leading-snug">
                            Haz clic en cualquier entrega de la lista para ver el progreso del artista y dejar tus comentarios.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
