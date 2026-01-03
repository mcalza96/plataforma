import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUserId, validateStaff } from '@/lib/infrastructure/auth-utils';
import { getTeacherAnalytics } from '@/lib/actions/teacher/teacher-analytics-actions';
import TeacherDashboardView from '@/components/teacher/TeacherDashboardView';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { getProactiveAlerts } from '@/lib/actions/teacher/pedagogical-actions';
import { getGlobalItemHealth } from '@/lib/actions/admin/admin-analytics-actions';

/**
 * TeacherDashboardPage: Faculty Intelligence Center
 * Displays cohort-level analytics without student-specific context
 * Activates TacticalStudentBridge on-demand when studentId query param present
 */
export default async function TeacherDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ studentId?: string }>
}) {
    // Await searchParams (Next.js 15 requirement)
    const params = await searchParams;

    // Step 1: Validate user is staff (teacher/instructor/admin)
    await validateStaff();

    const teacherId = await getUserId();
    if (!teacherId) {
        return redirect('/login');
    }

    // Step 2 & 3 & 4 & 6: Parallel Data Fetching
    const supabase = await createClient();

    const [analytics, profileRes, studentsRes, cohortListRes, proactiveAlerts, itemHealth] = await Promise.all([
        getTeacherAnalytics(),
        supabase.from('profiles').select('display_name, email').eq('id', teacherId).single(),
        supabase.from('learners').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId),
        supabase.from('learners').select('id, display_name, level').eq('teacher_id', teacherId).order('display_name'),
        getProactiveAlerts(),
        getGlobalItemHealth()
    ]);

    const { data: profile } = profileRes;
    const { data: students } = studentsRes;
    const { data: cohortList } = cohortListRes;

    const teacherName = profile?.display_name || profile?.email?.split('@')[0] || 'Profesor';
    const cohortSize = students?.length || 0;

    // Step 5: Fetch individual student data if studentId query param present (Sequential only if necessary)
    const studentId = params?.studentId;
    let selectedStudent = null;

    if (studentId) {
        const { data: studentData } = await supabase
            .from('learners')
            .select('id, display_name, level, avatar_url')
            .eq('id', studentId)
            .single();

        selectedStudent = studentData;
    }

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-white/5 border-t-primary animate-spin" />
                    <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Procesando Telemetría...</p>
                </div>
            </div>}>
                <TeacherDashboardView
                    teacherName={teacherName}
                    cohortSize={cohortSize}
                    analytics={analytics}
                    selectedStudent={selectedStudent}
                    cohortList={cohortList || []}
                    proactiveAlerts={proactiveAlerts}
                    itemHealth={itemHealth}
                />
            </Suspense>
        </div>
    );
}
