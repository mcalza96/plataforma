'use client';

export function CourseCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-[#1F1F1F] border border-white/5 shadow-lg">
            {/* Thumbnail Skeleton */}
            <div className="relative w-full aspect-[4/3] skeleton" />

            {/* Content Skeleton */}
            <div className="flex flex-col gap-4 p-5">
                <div className="space-y-2">
                    <div className="h-6 w-3/4 skeleton rounded" />
                    <div className="h-4 w-1/2 skeleton rounded opacity-50" />
                </div>

                {/* Progress Bar Skeleton */}
                <div className="h-8 w-full skeleton rounded-xl" />

                {/* Button Skeleton */}
                <div className="h-11 w-full skeleton rounded-xl" />
            </div>
        </div>
    );
}

export function ListRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            <div className="size-10 rounded-full skeleton shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 skeleton rounded" />
                <div className="h-3 w-1/3 skeleton rounded opacity-50" />
            </div>
            <div className="h-8 w-24 skeleton rounded-lg" />
        </div>
    );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    );
}
