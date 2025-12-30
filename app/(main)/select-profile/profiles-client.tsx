'use client';

import { useState, useTransition } from 'react';
import { selectLearner } from '@/lib/learner-actions';
import { createLearner } from '@/lib/learner-create-action';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Learner } from '@/lib/domain/course';

export default function ProfilesClient({ learners }: { learners: Learner[] }) {
    const [isPending, startTransition] = useTransition();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleSelect = async (id: string) => {
        await selectLearner(id);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        startTransition(async () => {
            const result = await createLearner(newName);
            if (result.success) {
                setIsCreating(false);
                setNewName('');
            }
        });
    };

    return (
        <div className="flex-1 flex items-center justify-center relative z-10 w-full px-6">
            <div className="flex flex-wrap justify-center gap-8 md:gap-14 w-full max-w-5xl">

                {learners.map((learner) => (
                    <div
                        key={learner.id}
                        onClick={() => handleSelect(learner.id)}
                        className="group/avatar flex flex-col items-center gap-6 cursor-pointer"
                    >
                        <div className="relative w-32 h-32 md:w-44 md:h-44 avatar-glow rounded-[3rem] border-4 border-surface transition-all duration-300 group-hover/avatar:scale-105 active:scale-95 bg-neutral-900 overflow-hidden">
                            <OptimizedImage
                                src={learner.avatar_url || ''}
                                alt={learner.display_name}
                                fill
                                className="object-cover"
                                fallbackIcon="person"
                            />

                            <svg className="absolute -inset-[4px] w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-[-90deg] z-20 pointer-events-none" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="2"></circle>
                                <circle
                                    cx="50" cy="50" fill="none" r="48"
                                    stroke={learner.level > 5 ? "#a855f7" : "#0d93f2"}
                                    strokeDasharray="301.59"
                                    strokeDashoffset={301.59 - (301.59 * (Math.min(learner.level, 10) / 10))}
                                    strokeLinecap="round"
                                    strokeWidth="2"
                                ></circle>
                            </svg>
                        </div>
                        <div className="text-center group-hover/avatar:translate-y-1 transition-transform">
                            <p className="text-2xl font-black text-white group-hover/avatar:text-primary transition-colors italic uppercase tracking-tighter">
                                {learner.display_name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">
                                Nivel {learner.level}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Add Profile */}
                {!isCreating ? (
                    <div
                        onClick={() => setIsCreating(true)}
                        className="group/add flex flex-col items-center gap-6 cursor-pointer"
                    >
                        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-[3rem] border-2 border-dashed border-white/10 flex items-center justify-center bg-transparent group-hover/add:bg-white/5 group-hover/add:border-primary/30 transition-all duration-300 active:scale-95">
                            <span className="material-symbols-outlined text-5xl text-gray-600 group-hover/add:text-primary transition-colors">add</span>
                        </div>
                        <div className="text-center group-hover/add:translate-y-1 transition-transform">
                            <p className="text-xl font-black text-gray-500 group-hover/add:text-white transition-colors uppercase italic tracking-tighter">Nuevo Artista</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 bg-[#252525] p-10 rounded-[3rem] border border-white/5 animate-in fade-in zoom-in duration-300 shadow-2xl">
                        <form onSubmit={handleCreate} className="flex flex-col gap-6 w-full min-w-[300px]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nombre del Artista</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ej. Alex"
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary outline-none font-bold"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isPending || !newName.trim()}
                                    className="h-14 bg-primary hover:bg-primary-hover text-white px-6 rounded-2xl text-sm font-black uppercase tracking-widest flex-1 disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="h-14 bg-white/5 hover:bg-white/10 text-gray-400 px-6 rounded-2xl text-sm font-black uppercase tracking-widest flex-1 active:scale-95 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
