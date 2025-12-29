'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/lib/feedback-actions';

interface ReviewPanelProps {
    submissionId: string;
    learnerId: string;
    badges: any[];
    history: any[];
}

export default function ReviewPanel({ submissionId, learnerId, badges, history }: ReviewPanelProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState('');
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');

    const handleSubmit = () => {
        if (!content.trim()) return;

        startTransition(async () => {
            const result = await submitReview({
                submissionId,
                learnerId,
                content,
                badgeId: selectedBadge
            });

            if (result.success) {
                router.push('/admin/submissions?tab=reviewed');
                router.refresh();
            } else {
                alert(result.error);
            }
        });
    };

    return (
        <div className="w-full lg:w-[450px] bg-[#1A1A1A] border-l border-white/5 flex flex-col shadow-2xl z-40">
            {/* Tabs Selector */}
            <div className="flex p-2 bg-[#252525] border-b border-white/5">
                <button
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'review' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    Escribir Corrección
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'history' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    Historial ({history.length})
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'review' ? (
                    <div className="space-y-10 pb-20">
                        {/* Feedback Text */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                Comentario Constructivo
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Escribe aquí tus consejos técnicos... ¡Recuerda motivar al alumno!"
                                className="w-full h-48 bg-white/5 border border-white/5 rounded-2xl p-6 text-sm text-gray-200 focus:border-amber-500/50 focus:ring-4 ring-amber-500/5 transition-all outline-none resize-none placeholder:text-gray-600 font-medium leading-relaxed"
                            />
                        </div>

                        {/* Badge Selector */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">stars</span>
                                Otorgar Insignia de Honor
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {badges.map((badge) => (
                                    <button
                                        key={badge.id}
                                        onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
                                        className={`p-5 rounded-[2rem] border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${selectedBadge === badge.id
                                            ? 'bg-amber-500 border-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
                                            : 'bg-white/[0.03] border-white/5 hover:border-amber-500/30'
                                            }`}
                                    >
                                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${selectedBadge === badge.id
                                                ? 'bg-black text-amber-500'
                                                : 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 text-amber-500'
                                            }`}>
                                            <span className="material-symbols-outlined text-2xl font-black">
                                                {badge.icon_name}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-tight leading-none mb-1 ${selectedBadge === badge.id ? 'text-black' : 'text-white'
                                                }`}>
                                                {badge.title}
                                            </p>
                                            <p className={`text-[10px] font-medium leading-tight ${selectedBadge === badge.id ? 'text-black/60' : 'text-gray-500'
                                                }`}>
                                                {badge.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {history.length === 0 ? (
                            <div className="py-20 text-center opacity-30">
                                <p className="text-xs uppercase font-black tracking-widest">Sin historial previo</p>
                            </div>
                        ) : history.map((msg) => (
                            <div key={msg.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                        {msg.sender_name}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-bold">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-xs leading-relaxed font-medium">
                                    {msg.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-8 bg-[#1A1A1A] border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <button
                    onClick={handleSubmit}
                    disabled={isPending || !content.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-3"
                >
                    {isPending ? (
                        <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                    ) : (
                        <span className="material-symbols-outlined text-xl">verified</span>
                    )}
                    <span className="uppercase tracking-widest text-xs">Finalizar y Enviar Feedback</span>
                </button>
            </div>
        </div>
    );
}
