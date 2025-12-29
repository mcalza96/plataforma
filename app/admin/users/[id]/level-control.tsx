'use client';

import { useState, useTransition } from 'react';
import { updateLearnerLevel } from '@/lib/admin-users-actions';
import Image from 'next/image';

interface LearnerLevelControlProps {
    learner: any;
    profileId: string;
}

export default function LearnerLevelControl({ learner, profileId }: LearnerLevelControlProps) {
    const [isPending, startTransition] = useTransition();
    const [level, setLevel] = useState(learner.level || 1);

    const handleLevelChange = (adjustment: number) => {
        const nextLevel = level + adjustment;
        if (nextLevel < 1 || nextLevel > 10) return;

        setLevel(nextLevel); // Optimistic update

        startTransition(async () => {
            const result = await updateLearnerLevel(learner.id, profileId, nextLevel);
            if (!result.success) {
                setLevel(level); // Revert on failure
                alert(result.error);
            }
        });
    };

    return (
        <div className="bg-[#252525] border border-white/5 p-6 rounded-[2rem] flex flex-col gap-6 hover:border-amber-500/30 transition-all duration-500 group">
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-3xl bg-neutral-900 border border-white/10 overflow-hidden relative shadow-2xl">
                    {learner.avatar_url ? (
                        <Image src={learner.avatar_url} alt={learner.display_name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30">
                            <span className="material-symbols-outlined text-4xl">face</span>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors">
                        {learner.display_name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Artista Alpha</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <span>Nivel de Maestría</span>
                    <span className="text-amber-500">Rango 1-10</span>
                </div>

                <div className="flex items-center gap-4 p-2 bg-black/20 rounded-2xl border border-white/5">
                    <button
                        onClick={() => handleLevelChange(-1)}
                        disabled={isPending || level <= 1}
                        className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 disabled:opacity-20 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined">remove</span>
                    </button>

                    <div className="flex-1 text-center relative">
                        <span className={`text-4xl font-black italic tracking-tighter ${isPending ? 'opacity-30' : 'text-white'}`}>
                            {level}
                        </span>
                        {isPending && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined animate-spin text-amber-500 text-xl">sync</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleLevelChange(1)}
                        disabled={isPending || level >= 10}
                        className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-500/20 hover:text-green-500 disabled:opacity-20 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>

            {/* Exp Bar Decoration */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{ width: `${(level / 10) * 100}%` }}
                />
            </div>
        </div>
    );
}
