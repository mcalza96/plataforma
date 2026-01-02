import { redirect } from 'next/navigation';
import { getUserId, validateStaff } from '@/lib/infrastructure/auth-utils';
import { getTeacherAnalytics } from '@/lib/actions/teacher/teacher-analytics-actions';
import { getTeacherIntegrityAlerts } from '@/lib/actions/teacher/analytics/integrity-actions';
import TeacherDashboardView from '@/components/teacher/TeacherDashboardView';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

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

    // Step 2: Parallel data resolution (Cohort Analytics/Integrity Alerts/Draft Exams)
    const [analytics, integrityAlerts, draftExamsData] = await Promise.all([
        getTeacherAnalytics(), // Cohort-level aggregated data
        getTeacherIntegrityAlerts(),
        // Fetch draft exams for Engineering Lab widget
        (async () => {
            const supabase = await createClient();
            const { data } = await supabase
                .from('exams')
                .select('id, title, updated_at')
                .eq('creator_id', teacherId)
                .eq('status', 'DRAFT')
                .order('updated_at', { ascending: false })
                .limit(3);
            return { data: data || [] };
        })()
    ]);

    const draftExams = draftExamsData.data;

    // Step 3: Get teacher profile for Faculty Header
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', teacherId)
        .single();

    const teacherName = profile?.display_name || profile?.email?.split('@')[0] || 'Profesor';

    // Step 4: Get cohort size
    const { data: students } = await supabase
        .from('learners')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', teacherId);

    const cohortSize = students?.length || 0;

    // Step 5: Fetch individual student data if studentId query param present
    const studentId = params?.studentId;
    let selectedStudent = null;

    if (studentId) {
        // Validate student belongs to teacher's cohort
        const { data: studentData } = await supabase
            .from('learners')
            .select('id, display_name, level, avatar_url')
            .eq('id', studentId)
            .eq('teacher_id', teacherId)
            .single();

        selectedStudent = studentData;
    }

    // Step 6: Fetch cohort list for StudentSelector
    const { data: cohortList } = await supabase
        .from('learners')
        .select('id, display_name, level')
        .eq('teacher_id', teacherId)
        .order('display_name');

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <TeacherDashboardView
                teacherName={teacherName}
                cohortSize={cohortSize}
                analytics={analytics}
                integrityAlerts={integrityAlerts}
                draftExams={draftExams}
                selectedStudent={selectedStudent}
                cohortList={cohortList || []}
            />
        </div>
    );
}
