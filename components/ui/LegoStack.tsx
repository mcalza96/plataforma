'use client';

import { useEffect, useState } from 'react';

interface LegoStackProps {
    completedSteps: number;
    totalSteps: number;
    variant?: 'primary' | 'secondary' | 'violet';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export default function LegoStack({
    completedSteps,
    totalSteps,
    variant = 'primary',
    orientation = 'horizontal',
    className = ''
}: LegoStackProps) {
    const [prevCompleted, setPrevCompleted] = useState(completedSteps);
    const [animateIndex, setAnimateIndex] = useState<number | null>(null);

    useEffect(() => {
        if (completedSteps > prevCompleted) {
            setAnimateIndex(completedSteps - 1);
            setPrevCompleted(completedSteps);
            const timer = setTimeout(() => setAnimateIndex(null), 1000);
            return () => clearTimeout(timer);
        } else {
            setPrevCompleted(completedSteps);
        }
    }, [completedSteps]);

    const colors = {
        primary: {
            bg: 'bg-primary',
            shadow: 'border-b-primary-dark shadow-[0_4px_0_0_#0a74be,0_0_15px_rgba(13,147,242,0.3)]',
            active: 'ring-2 ring-white/30'
        },
        secondary: {
            bg: 'bg-secondary',
            shadow: 'border-b-secondary-dark shadow-[0_4px_0_0_#8b44cc,0_0_15px_rgba(168,85,247,0.3)]',
            active: 'ring-2 ring-white/30'
        },
        violet: {
            bg: 'bg-[#8B5CF6]',
            shadow: 'border-b-[#6D28D9] shadow-[0_4px_0_0_#5B21B6,0_0_15px_rgba(139,92,246,0.3)]',
            active: 'ring-2 ring-white/30'
        }
    };

    const activeColor = colors[variant] || colors.primary;

    return (
        <div className={`flex ${orientation === 'horizontal' ? 'flex-row gap-1' : 'flex-col-reverse gap-1'} ${className}`}>
            {Array.from({ length: totalSteps }).map((_, i) => {
                const isCompleted = i < completedSteps;
                const isCurrent = i === completedSteps;
                const shouldAnimate = i === animateIndex;

                return (
                    <div
                        key={i}
                        className={`
                            relative flex-1 rounded-sm transition-all duration-500
                            ${orientation === 'horizontal' ? 'h-3 min-w-[12px]' : 'w-full h-4'}
                            ${isCompleted
                                ? `${activeColor.bg} ${activeColor.shadow} ${shouldAnimate ? 'animate-bounce-snappy' : ''}`
                                : isCurrent
                                    ? 'bg-white/10 ring-1 ring-white/20 border-b-2 border-white/5'
                                    : 'bg-white/5 border-b-2 border-transparent'
                            }
                        `}
                    >
                        {/* Lego Studs (Optional visual detail) */}
                        <div className="absolute -top-0.5 inset-x-0 flex justify-around opacity-30">
                            <div className="size-1 rounded-full bg-white/20"></div>
                            <div className="size-1 rounded-full bg-white/20"></div>
                        </div>
                    </div>
                );
            })}

            <style jsx global>{`
                @keyframes bounce-snappy {
                    0%, 100% { transform: translateY(0) scale(1); }
                    40% { transform: translateY(-8px) scale(1.1); }
                    60% { transform: translateY(-4px) scale(1.05); }
                    80% { transform: translateY(-2px) scale(1.02); }
                }
                .animate-bounce-snappy {
                    animation: bounce-snappy 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
        </div>
    );
}

// Tailscale dark colors mock for reference
// primary-dark: #0a74be
// secondary-dark: #8b44cc
