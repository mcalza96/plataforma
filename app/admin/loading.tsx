'use client';

import React from 'react';

export default function AdminLoading() {
    return (
        <div className="flex-1 w-full p-6 animate-in fade-in duration-300 bg-background-dark">
            {/* Dashboard Skeleton */}
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="h-12 w-64 bg-surface/20 rounded-xl animate-pulse" />

                {/* Metrics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-surface/20 rounded-2xl animate-pulse" />
                    ))}
                </div>

                {/* Table/Content Skeleton */}
                <div className="bg-surface/10 rounded-3xl border border-white/5 h-[600px] animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-12" />
                </div>
            </div>

            {/* Floating Status Indicator */}
            <div className="fixed bottom-12 right-12 flex flex-col items-end gap-2 text-primary">
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="size-2 rounded-full bg-primary animate-ping" />
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">Sincronizando Inteligencia...</p>
                </div>
            </div>
        </div>
    );
}
