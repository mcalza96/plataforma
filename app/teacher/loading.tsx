import React from 'react';

export default function TeacherLoading() {
    return (
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 animate-in fade-in duration-200">
            {/* Skeleton Header */}
            <div className="h-32 w-full bg-surface/20 rounded-3xl animate-pulse mb-12" />

            {/* Skeleton Student Selector */}
            <div className="flex justify-end mb-6">
                <div className="h-10 w-48 bg-surface/20 rounded-xl animate-pulse" />
            </div>

            {/* Skeleton Grid */}
            <div className="space-y-16">
                {/* Cognitive Health Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-surface/10 rounded-2xl animate-pulse" />
                    ))}
                </div>

                {/* Main Content Area Skeleton */}
                <div className="h-[600px] bg-surface/5 rounded-[3rem] border border-white/5 animate-pulse" />
            </div>

            <div className="fixed bottom-12 right-12 flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="size-2 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sincronizando Inteligencia...</span>
                </div>
            </div>
        </div>
    );
}
