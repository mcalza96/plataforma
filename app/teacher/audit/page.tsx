import { redirect } from 'next/navigation';
import { getUserId, validateStaff } from '@/lib/infrastructure/auth-utils';
import { getTeacherIntegrityAlerts } from '@/lib/actions/teacher/analytics/integrity-actions';
import AuditDashboardView from '@/components/teacher/audit/AuditDashboardView';
import { createClient } from '@/lib/infrastructure/supabase/supabase-server';

/**
 * TeacherAuditPage: Forensic Monitoring Center
 */
export default async function TeacherAuditPage() {
    // Step 1: Validate access
    await validateStaff();

    const teacherId = await getUserId();
    if (!teacherId) {
        return redirect('/login');
    }

    // Step 2: Fetch data
    const [integrityAlerts, profileData, studentsData] = await Promise.all([
        getTeacherIntegrityAlerts(),
        (async () => {
            const supabase = await createClient();
            return await supabase
                .from('profiles')
                .select('display_name, email')
                .eq('id', teacherId)
                .single();
        })(),
        (async () => {
            const supabase = await createClient();
            return await supabase
                .from('learners')
                .select('id', { count: 'exact', head: true })
                .eq('teacher_id', teacherId);
        })()
    ]);

    const profile = profileData.data;
    const teacherName = profile?.display_name || profile?.email?.split('@')[0] || 'Profesor';
    const cohortSize = studentsData.count || 0;

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <AuditDashboardView
                teacherName={teacherName}
                cohortSize={cohortSize}
                integrityAlerts={integrityAlerts}
            />
        </div>
    );
}
