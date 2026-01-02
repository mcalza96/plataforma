import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    getStudentFullStats
} from '@/lib/actions/teacher/teacher-actions';
import { getTeacherAnalytics } from '@/lib/actions/teacher/teacher-analytics-actions';
import { getStudentById } from '@/lib/data/learner';
import TeacherDashboardView from '@/components/teacher/TeacherDashboardView';

/**
 * TeacherDashboardPage: Server-side data orchestrator.
 * SRP: Responsibility is ONLY to fetch data and select the proper view.
 */
export default async function TeacherDashboardPage() {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;

    if (!studentId) {
        return redirect('/select-profile');
    }

    // Step 1: Fetch Student Context
    const student = await getStudentById(studentId);
    if (!student) return redirect('/select-profile');

    // Step 2: Parallel data resolution (Wayfinding/Stats/Analytics)
    const [stats, analytics] = await Promise.all([
        getStudentFullStats(studentId),
        getTeacherAnalytics()
    ]);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <TeacherDashboardView
                student={student}
                stats={stats}
                analytics={analytics}
            />
        </div>
    );
}
