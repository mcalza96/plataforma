import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getStudentById } from '@/lib/data/courses';
import { Suspense } from 'react';
import DashboardFeedback from '@/components/dashboard/DashboardFeedback';
import DashboardActiveMissions from '@/components/dashboard/DashboardActiveMissions';
import { GridSkeleton } from '@/components/ui/skeletons';
import { ExecutiveIntelligenceSection } from '@/components/dashboard/ExecutiveIntelligenceSection';
import { KnowledgeMapSection } from '@/components/dashboard/KnowledgeMapSection';
import { InterfaceAdaptationService } from '@/lib/application/services/interface-adapter';
import { ModeContainer } from '@/components/dashboard/adaptive/ModeContainer';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        return redirect('/select-profile');
    }

    const student = await getStudentById(studentId);
    if (!student) {
        return redirect('/select-profile');
    }

    // Infer UI Mode
    const uiMode = InterfaceAdaptationService.getInterfaceMode(student);
    const config = InterfaceAdaptationService.getConfig(uiMode);

    // Fetch Standalone Diagnostics (Group A)
    const { getStudentService } = await import('@/lib/infrastructure/di');
    const studentService = getStudentService();
    const standaloneAssignments = await studentService.getStandaloneAssignments(studentId);

    // Lazy load the section component to avoid circular deps if any, though import is fine here
    const { StandaloneDiagnosticsSection } = await import('@/components/dashboard/StandaloneDiagnosticsSection');

    return (
        <ModeContainer mode={uiMode}>
            {/* Header Section - Adaptive Copy */}
            <div className={`flex flex-wrap justify-between items-end gap-6 pb-4 border-b border-[#223949] ${uiMode === 'DASHBOARD' ? 'col-span-full' : ''}`}>
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                        {uiMode === 'MISSION' ? '¡Hola, ' : 'Bienvenido, '}
                        <span className="text-primary">{student.display_name}.</span>
                    </h1>
                    <p className="text-[#90b2cb] text-lg font-normal leading-normal">
                        {uiMode === 'MISSION' ? '¿Cuál es nuestra misión de hoy?' : 'Tu estudio creativo está listo.'}
                    </p>
                </div>
                {uiMode !== 'MISSION' && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-[#90b2cb] uppercase tracking-wider">Nivel Actual</span>
                            <span className="text-xl font-bold text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-secondary fill-1">bolt</span>
                                Estudiante Nvl. {student.level}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* HIGH PRIORITY: Standalone Diagnostics Hero Section */}
            {standaloneAssignments.length > 0 && (
                <div className="col-span-full">
                    <StandaloneDiagnosticsSection
                        assignments={standaloneAssignments}
                        mode={uiMode}
                    />
                </div>
            )}

            {/* Knowledge Map - Central Hub */}
            {/* In Dashboard/Explorer it takes prominent space, in Mission it's the main focus */}
            <div className={`${uiMode === 'DASHBOARD' ? 'col-span-2 row-span-2' : ''}`}>
                <Suspense fallback={<div className="h-96 bg-zinc-900/40 animate-pulse rounded-3xl border border-white/5" />}>
                    <KnowledgeMapSection mode={uiMode} />
                </Suspense>
            </div>

            {/* Insight & Feedback Column */}
            <div className="flex flex-col gap-6">
                {/* Executive Intelligence - Hidden for Mission Mode */}
                {config?.showCognitiveMirror && (
                    <Suspense fallback={<div className="h-64 bg-slate-800/30 animate-pulse rounded-2xl" />}>
                        <ExecutiveIntelligenceSection />
                    </Suspense>
                )}

                {/* Feedback Feed */}
                <Suspense fallback={<div className="h-24 bg-white/5 animate-pulse rounded-2xl" />}>
                    <DashboardFeedback studentId={studentId} />
                </Suspense>
            </div>

            {/* Missions List - Secondary for Dashboard, Primary for Mission? */}
            {/* Actually in Mission Mode, the Map Section acts as the "Active Mission" CTA. 
                 We might hide the generic list or simplify it. */}
            {uiMode !== 'MISSION' && (
                <div className={`${uiMode === 'DASHBOARD' ? 'col-span-full' : ''}`}>
                    <Suspense fallback={<GridSkeleton count={3} />}>
                        <DashboardActiveMissions studentId={studentId} />
                    </Suspense>
                </div>
            )}
        </ModeContainer>
    );
}

