import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { Student } from '../../domain/entities/learner';
import { StudentStats, StudentAchievement, KnowledgeDelta, LearningFrontier } from '../../domain/dtos/learner';
import { LearnerLevel } from '../../domain/value-objects';
import { AuthGuard } from '../guards/auth-guard';
import { GetStudentStatsUseCase } from '../use-cases/get-student-stats-use-case';

export class StudentService {
    private getStatsUC: GetStudentStatsUseCase;

    constructor(
        private learnerRepository: IStudentRepository,
        private statsRepository: IStatsRepository,
        private courseReader: ICourseReader
    ) {
        this.getStatsUC = new GetStudentStatsUseCase(this.statsRepository, this.courseReader);
    }

    async getStudentById(studentId: string): Promise<Student | null> {
        return this.learnerRepository.getStudentById(studentId);
    }

    async updateStudentLevel(studentId: string, newLevel: number, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin']);
        new LearnerLevel(newLevel);
        return this.learnerRepository.updateStudentLevel(studentId, newLevel);
    }

    async getStudentFullStats(studentId: string): Promise<StudentStats> {
        return this.getStatsUC.execute(studentId);
    }

    async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
        return this.statsRepository.getStudentAchievements(studentId);
    }

    async createStudent(data: { teacherId: string; displayName: string; avatarUrl: string }): Promise<Student> {
        return this.learnerRepository.createStudent(data);
    }

    async ensureProfileExists(data: { id: string; email: string; fullName: string }): Promise<void> {
        return this.learnerRepository.ensureProfileExists(data);
    }

    async getStudentsByTeacherId(teacherId: string): Promise<Student[]> {
        return this.learnerRepository.getStudentsByTeacherId(teacherId);
    }

    async getStudentFrontier(studentId: string): Promise<LearningFrontier[]> {
        return this.statsRepository.getStudentFrontier(studentId);
    }

    async calculateKnowledgeDelta(studentId: string): Promise<KnowledgeDelta[]> {
        const stats = await this.getStudentFullStats(studentId);

        // Calculate delta with a more realistic baseline (75% of current)
        return stats.skills.map(s => ({
            category: s.name,
            initial: Math.max(10, Math.round(s.percentage * 0.75)),
            current: s.percentage
        }));
    }

    async executeMutations(studentId: string, mutations: any[]): Promise<boolean> {
        return this.learnerRepository.executeGraphMutations(studentId, mutations);
    }

    async getStandaloneAssignments(studentId: string): Promise<import('../../domain/dtos/learner').StandaloneExamAssignment[]> {
        return this.learnerRepository.getStandaloneAssignments(studentId);
    }
}
