'use client';

import { useState } from 'react';
import { updateLearnerLevel } from '@/lib/admin-users-actions';

interface LevelEditorProps {
    learnerId: string;
    profileId: string;
    initialLevel: number;
}

export default function LevelEditor({ learnerId, profileId, initialLevel }: LevelEditorProps) {
    const [level, setLevel] = useState(initialLevel);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdate = async (newLevel: number) => {
        setIsUpdating(true);
        setMessage(null);
        try {
            await updateLearnerLevel(learnerId, profileId, newLevel);
            setLevel(newLevel);
            setMessage({ type: 'success', text: 'Nivel actualizado' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex bg-neutral-900 rounded-xl p-1 border border-white/5">
                    {[...Array(10)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handleUpdate(i + 1)}
                            disabled={isUpdating}
                            className={`
                                w-8 h-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center
                                ${level === i + 1
                                    ? 'bg-amber-500 text-black scale-110 shadow-lg'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}
                                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                {isUpdating && (
                    <span className="material-symbols-outlined text-amber-500 animate-spin text-sm">sync</span>
                )}
            </div>
            {message && (
                <p className={`text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1
                    ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
}
