export default function Loading() {
    return (
        <div className="flex-1 p-8 space-y-12 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-end justify-between">
                <div className="space-y-4">
                    <div className="w-32 h-4 skeleton rounded" />
                    <div className="w-64 h-12 skeleton rounded-2xl" />
                </div>
                <div className="w-48 h-12 skeleton rounded-2xl" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-video bg-[#1F1F1F] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                        <div className="flex-1 skeleton" />
                        <div className="p-8 space-y-4">
                            <div className="w-3/4 h-6 skeleton rounded" />
                            <div className="flex justify-between">
                                <div className="w-20 h-4 skeleton rounded" />
                                <div className="w-20 h-4 skeleton rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
