import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
    getStudentFullStats,
    getTeacherFeedback,
    getStudentAchievements,
    getKnowledgeDelta,
    getLearningFrontier
} from '@/lib/actions/teacher/teacher-actions';
import { getStudentById } from '@/lib/data/courses';
import Header from '@/components/layout/header';
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

    // Step 2: Parallel data resolution (Wayfinding/Stats/Feedback/Achievements)
    const [stats, feedback, achievements, knowledgeDelta, frontier] = await Promise.all([
        getStudentFullStats(studentId),
        getTeacherFeedback(studentId),
        getStudentAchievements(studentId),
        getKnowledgeDelta(studentId),
        getLearningFrontier(studentId)
    ]);

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <TeacherDashboardView
                student={student}
                stats={{
                    ...stats,
                    skills: stats.skills.map(s => ({ ...s, description: '' })) // Ensure descriptions exist for tooltips
                }}
                feedback={feedback}
                achievements={achievements}
                knowledgeDelta={knowledgeDelta}
                frontier={frontier}
            />
        </div>
    );
}
