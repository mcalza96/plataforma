'use client';

import Link from 'next/link';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] animate-in fade-in zoom-in duration-700 ${className}`}>
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative size-20 bg-neutral-800 rounded-2xl flex items-center justify-center text-gray-500 shadow-xl border border-white/5 transform hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-5xl animate-bounce-slow">
                        {icon}
                    </span>
                </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-[#90b2cb] max-w-sm mx-auto mb-8 text-lg font-medium leading-relaxed">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="bg-primary hover:bg-primary/80 text-white px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all click-shrink shadow-[0_10px_30px_rgba(13,147,242,0.3)] btn-shine"
                >
                    {actionLabel}
                </Link>
            )}

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
