import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import {
    getLearnerFullStats,
    getInstructorFeedback,
    getLearnerAchievements,
    getKnowledgeDelta,
    getLearningFrontier
} from '@/lib/parent';
import { getLearnerById } from '@/lib/data/courses';
import Header from '@/components/layout/header';
import ParentDashboardView from '@/components/parent/ParentDashboardView';

/**
 * ParentDashboardPage: Server-side data orchestrator.
 * SRP: Responsibility is ONLY to fetch data and select the proper view.
 */
export default async function ParentDashboardPage() {
    const cookieStore = await cookies();
    const learnerId = cookieStore.get('learner_id')?.value;

    if (!learnerId) {
        return redirect('/select-profile');
    }

    // Step 1: Fetch Learner Context
    const learner = await getLearnerById(learnerId);
    if (!learner) return redirect('/select-profile');

    // Step 2: Parallel data resolution (Wayfinding/Stats/Feedback)
    const [stats, feedback, achievements, knowledgeDelta, frontier] = await Promise.all([
        getLearnerFullStats(learnerId),
        getInstructorFeedback(learnerId),
        getLearnerAchievements(learnerId),
        getKnowledgeDelta(learnerId),
        getLearningFrontier(learnerId)
    ]);

    // Format knowledge delta for UI pure components
    const uiKnowledgeDelta = knowledgeDelta.map(d => ({
        category: d.category,
        initial: d.initial_score,
        current: d.current_mastery
    }));

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
            <ParentDashboardView
                learner={learner}
                stats={{
                    ...stats,
                    skills: stats.skills.map(s => ({ ...s, description: '' })) // Ensure descriptions exist for tooltips
                }}
                feedback={feedback}
                achievements={achievements}
                knowledgeDelta={uiKnowledgeDelta}
                frontier={frontier}
            />
        </div>
    );
}
