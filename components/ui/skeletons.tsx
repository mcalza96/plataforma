import { cn } from '@/lib/utils';

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export function CompetencyGraphSkeleton() {
    return (
        <div className="w-full h-[400px] bg-gray-50/50 rounded-xl border border-gray-100 p-4 flex items-center justify-center relative overflow-hidden">
            {/* Mock Nodes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-200 animate-pulse z-10" />
            <div className="absolute top-1/3 left-1/3 w-12 h-12 rounded-full bg-gray-100 animate-pulse delay-75" />
            <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-gray-100 animate-pulse delay-100" />

            {/* Mock Connections (SVG Lines) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="33%" y1="33%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="66%" y1="66%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            <span className="sr-only">Cargando Grafo de Competencias...</span>
        </div>
    )
}

export function DiagnosisCardSkeleton() {
    return (
        <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
        </div>
    )
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
