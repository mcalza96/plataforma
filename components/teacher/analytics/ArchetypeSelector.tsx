'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, AlertTriangle, Zap, Target, HelpCircle } from 'lucide-react';

interface ArchetypeSelectorProps {
    onSelect: (archetype: string | null) => void;
    selected: string | null;
    counts: Record<string, number>;
}

/**
 * ArchetypeSelector - Filtro rápido por estado metacognitivo para el Centro de Mando.
 */
export function ArchetypeSelector({ onSelect, selected, counts }: ArchetypeSelectorProps) {
    const archetypes = [
        { id: 'MASTER', label: 'Maestros', icon: ShieldCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { id: 'DELUSIONAL', label: 'Delirantes', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 'UNCERTAIN', label: 'Inseguros', icon: HelpCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { id: 'DEVELOPING', label: 'At Risk', icon: Zap, color: 'text-magenta-400', bg: 'bg-magenta-500/10' },
    ];

    return (
        <div className="flex items-center gap-3">
            {archetypes.map((arch) => {
                const Icon = arch.icon;
                const isActive = selected === arch.id;

                return (
                    <button
                        key={arch.id}
                        onClick={() => onSelect(isActive ? null : arch.id)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all active:scale-95 group relative overflow-hidden",
                            isActive
                                ? "bg-white/5 border-white/20 text-white"
                                : "bg-transparent border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300"
                        )}
                    >
                        <div className={cn("size-6 rounded-lg flex items-center justify-center transition-colors", arch.bg)}>
                            <Icon size={14} className={arch.color} />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[9px] font-black uppercase tracking-widest">{arch.label}</span>
                            <span className="text-xs font-mono font-bold">{counts[arch.id] || 0}</span>
                        </div>

                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
                                style={{ color: arch.color.replace('text-', '') }} />
                        )}
                    </button>
                );
            })}

            {selected && (
                <button
                    onClick={() => onSelect(null)}
                    className="text-[9px] font-black text-zinc-600 uppercase hover:text-white transition-colors ml-2"
                >
                    Limpiar Filtro
                </button>
            )}
        </div>
    );
}
