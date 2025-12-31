import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { LearnerStats, LearnerAchievement } from '../../domain/dtos/learner';
import { createClient } from './supabase-server';

export class SupabaseStatsRepository implements IStatsRepository {
    async getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
        const supabase = await createClient();

        // 1. Total Completed Lessons
        const { count: completedLections } = await supabase
            .from('learner_progress')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', learnerId)
            .eq('is_completed', true);

        // 2. Total Submissions (Projects)
        const { count: totalProjects } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('learner_id', learnerId);

        // 3. Estimated Hours
        const { data: progressData } = await supabase
            .from('learner_progress')
            .select('completed_steps')
            .eq('learner_id', learnerId);

        const totalSteps = progressData?.reduce((acc, curr) => acc + (curr.completed_steps || 0), 0) || 0;
        const hoursPracticed = Math.round((totalSteps * 15) / 60);

        // 4. Skills by Category
        const { data: courses } = await supabase
            .from('courses')
            .select(`
                category,
                lessons (
                    id,
                    total_steps,
                    learner_progress (
                        learner_id,
                        completed_steps
                    )
                )
            `);

        const skillsMap: Record<string, { completed: number; total: number }> = {};

        courses?.forEach(course => {
            const cat = course.category || 'General';
            if (!skillsMap[cat]) skillsMap[cat] = { completed: 0, total: 0 };

            course.lessons?.forEach((lesson: any) => {
                skillsMap[cat].total += lesson.total_steps;
                const progress = lesson.learner_progress?.find((p: any) => p.learner_id === learnerId);
                skillsMap[cat].completed += progress?.completed_steps || 0;
            });
        });

        const skillColors = ['#a855f7', '#0d93f2', '#10b981', '#f59e0b'];
        const skills = Object.entries(skillsMap).map(([name, data], index) => ({
            name,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
            color: skillColors[index % skillColors.length]
        }));

        return {
            totalProjects: totalProjects || 0,
            hoursPracticed: hoursPracticed || 0,
            completedLections: completedLections || 0,
            skills
        };
    }

    async getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('learner_achievements')
            .select(`
                unlocked_at,
                achievements (*)
            `)
            .eq('learner_id', learnerId);

        if (error) {
            console.error('Error fetching achievements in repository:', error);
            return [];
        }

        return (data || []).map((item: any) => ({
            unlocked_at: item.unlocked_at,
            achievements: Array.isArray(item.achievements) ? item.achievements[0] : item.achievements
        })) as LearnerAchievement[];
    }

    async getStudentFrontier(learnerId: string): Promise<any[]> {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('get_student_frontier', {
            p_learner_id: learnerId
        });

        if (error) {
            console.error('Error fetching student frontier:', error);
            return [];
        }

        return data as any[];
    }

    async getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }> {
        const supabase = await createClient();

        const [
            { count: totalLearners },
            { count: totalSubmissions },
            { count: totalCourses }
        ] = await Promise.all([
            supabase.from('learners').select('*', { count: 'exact', head: true }),
            supabase.from('submissions').select('*', { count: 'exact', head: true }),
            supabase.from('courses').select('*', { count: 'exact', head: true })
        ]);

        return {
            totalLearners: totalLearners || 0,
            totalSubmissions: totalSubmissions || 0,
            totalCourses: totalCourses || 0
        };
    }
}
