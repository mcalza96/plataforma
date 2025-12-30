export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
    );
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 h-64 animate-pulse">
                    <div className="h-4 w-1/4 bg-white/10 rounded mb-4" />
                    <div className="h-8 w-3/4 bg-white/10 rounded mb-4" />
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-white/5 rounded" />
                        <div className="h-3 w-full bg-white/5 rounded" />
                        <div className="h-3 w-2/3 bg-white/5 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
