'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Hammer, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BuilderMode } from './BuilderLayout';

interface BuilderModeToggleProps {
    mode: BuilderMode;
    onChange: (mode: BuilderMode) => void;
    isReadyToBuild?: boolean;
}

export function BuilderModeToggle({ mode, onChange, isReadyToBuild }: BuilderModeToggleProps) {
    const modes: { id: BuilderMode; label: string; icon: any }[] = [
        { id: 'interview', label: 'Entrevista', icon: MessageSquare },
        { id: 'construction', label: 'Construcción', icon: Hammer },
        { id: 'preview', label: 'Vista Previa', icon: Eye },
    ];

    return (
        <div className="flex items-center bg-[#252525] border border-[#333333] p-1 rounded-2xl">
            {modes.map((m) => {
                const Icon = m.icon;
                const isActive = mode === m.id;
                const isDisabled = m.id !== 'interview' && !isReadyToBuild && mode === 'interview';

                return (
                    <button
                        key={m.id}
                        onClick={() => !isDisabled && onChange(m.id)}
                        disabled={isDisabled}
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            isActive ? "text-white" : "text-gray-500 hover:text-gray-300",
                            isDisabled && "opacity-20 cursor-not-allowed"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-mode-bg"
                                className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <Icon className={cn("size-3.5", isActive ? "text-amber-500" : "text-current")} />
                        <span className="relative z-10">{m.label}</span>

                        {m.id === 'construction' && isReadyToBuild && !isActive && (
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
