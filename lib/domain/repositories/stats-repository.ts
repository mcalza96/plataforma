import { LearnerStats, LearnerAchievement } from '../dtos/learner';

export interface IStatsRepository {
    getLearnerFullStats(learnerId: string): Promise<LearnerStats>;
    getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]>;
    getStudentFrontier(learnerId: string): Promise<any[]>;
    getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }>;
}
