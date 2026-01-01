import { LearnerStats, LearnerAchievement, LearningFrontier } from '../dtos/learner';

export interface IStatsRepository {
    getLearnerFullStats(learnerId: string): Promise<LearnerStats>;
    getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]>;
    getStudentFrontier(learnerId: string): Promise<LearningFrontier[]>;
    getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }>;
}
