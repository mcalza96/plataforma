import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLearnerById } from '@/lib/data/courses';
import { Suspense } from 'react';
import DashboardFeedback from '@/components/dashboard/DashboardFeedback';
import DashboardActiveMissions from '@/components/dashboard/DashboardActiveMissions';
import { GridSkeleton } from '@/components/ui/skeletons';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    const learner = await getLearnerById(learnerId);
    if (!learner) {
        return redirect('/select-profile');
    }

    return (
        <main className="flex-1 flex justify-center py-8 px-4 sm:px-10 lg:px-20 bg-[#121e26]">
            <div className="flex flex-col max-w-[1200px] w-full gap-10">

                {/* Welcome Section */}
                <div className="flex flex-wrap justify-between items-end gap-6 pb-4 border-b border-[#223949]">
                    <div className="flex min-w-72 flex-col gap-2">
                        <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                            Hola, <span className="text-primary">{learner.display_name}.</span>
                        </h1>
                        <p className="text-[#90b2cb] text-lg font-normal leading-normal">
                            Tu estudio creativo está listo. ¿Qué vamos a crear hoy?
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-[#90b2cb] uppercase tracking-wider">Nivel Actual</span>
                            <span className="text-xl font-bold text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-secondary fill-1">bolt</span>
                                Artista Nvl. {learner.level}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Professor Feedback Notification - Streamed */}
                <Suspense fallback={<div className="h-24 bg-white/5 animate-pulse rounded-2xl" />}>
                    <DashboardFeedback learnerId={learnerId} />
                </Suspense>

                {/* Missions & Challenges - Streamed */}
                <Suspense fallback={<GridSkeleton count={3} />}>
                    <DashboardActiveMissions learnerId={learnerId} />
                </Suspense>

            </div>
        </main>
    );
}
