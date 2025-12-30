import { CompetencyGraphSkeleton, DiagnosisCardSkeleton, GridSkeleton } from '@/components/ui/skeletons';

export default function AdminLoading() {
    return (
        <div className="space-y-6 p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-64 bg-gray-100/50 rounded-md animate-pulse" />
                <div className="h-10 w-32 bg-gray-100/50 rounded-md animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area - Graph */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="h-6 w-48 bg-gray-100 rounded mb-4 animate-pulse" />
                        <CompetencyGraphSkeleton />
                    </div>

                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DiagnosisCardSkeleton />
                        <DiagnosisCardSkeleton />
                    </div>
                </div>

                {/* Sidebar / Secondary Stats */}
                <div className="space-y-6">
                    <GridSkeleton count={2} />
                    <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
