'use client';

import React from 'react';

export default function StudentLoading() {
    return (
        <div className="flex-1 w-full p-6 animate-in fade-in duration-300 bg-background-dark">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Adaptive Header Skeleton */}
                <div className="flex flex-wrap justify-between items-end gap-6 pb-4 border-b border-white/5">
                    <div className="space-y-4">
                        <div className="h-12 w-80 bg-surface/20 rounded-2xl animate-pulse" />
                        <div className="h-6 w-48 bg-surface/10 rounded-xl animate-pulse" />
                    </div>
                    <div className="h-12 w-48 bg-surface/20 rounded-full animate-pulse hidden md:block" />
                </div>

                {/* Hero Section Skeleton */}
                <div className="h-64 w-full bg-surface/10 rounded-[2.5rem] border border-white/5 animate-pulse overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                </div>

                {/* Grid Content Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-[400px] bg-surface/5 rounded-[3rem] border border-white/5 animate-pulse" />
                        <div className="h-32 bg-surface/5 rounded-[2rem] border border-white/5 animate-pulse" />
                    </div>
                    <div className="space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-surface/10 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Status Indicator - Creative version */}
            <div className="fixed bottom-12 right-12 flex flex-col items-end gap-2 text-primary">
                <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full shadow-2xl backdrop-blur-md">
                    <div className="relative size-3">
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                        <div className="relative size-3 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">Cargando Diagnóstico...</p>
                </div>
            </div>
        </div>
    );
}
