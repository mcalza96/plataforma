import { StudentStats, StudentAchievement, LearningFrontier } from '../dtos/learner';

export interface IStatsRepository {
    getStudentFullStats(studentId: string): Promise<StudentStats>;
    getStudentAchievements(studentId: string): Promise<StudentAchievement[]>;
    getStudentFrontier(studentId: string): Promise<LearningFrontier[]>;
    getGlobalStats(teacherId?: string): Promise<{
        totalStudents: number;
        totalSubmissions: number;
        totalCourses: number;
    }>;
}
