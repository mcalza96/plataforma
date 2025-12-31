import { ILearnerRepository } from '../../domain/repositories/learner-repository';
import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { Learner } from '../../domain/entities/learner';
import { LearnerStats, LearnerAchievement } from '../../domain/dtos/learner';
import { LearnerLevel } from '../../domain/value-objects';
import { AuthGuard } from '../guards/auth-guard';
import { GetLearnerStatsUseCase } from '../use-cases/get-learner-stats-use-case';

export class LearnerService {
    private getStatsUC: GetLearnerStatsUseCase;

    constructor(
        private learnerRepository: ILearnerRepository,
        private statsRepository: IStatsRepository,
        private courseReader: ICourseReader
    ) {
        this.getStatsUC = new GetLearnerStatsUseCase(this.statsRepository, this.courseReader);
    }

    async getLearnerById(learnerId: string): Promise<Learner | null> {
        return this.learnerRepository.getLearnerById(learnerId);
    }

    async updateLearnerLevel(learnerId: string, newLevel: number, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin']);
        new LearnerLevel(newLevel);
        return this.learnerRepository.updateLearnerLevel(learnerId, newLevel);
    }

    async getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
        return this.getStatsUC.execute(learnerId);
    }

    async getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]> {
        return this.statsRepository.getLearnerAchievements(learnerId);
    }

    async createLearner(data: { parentId: string; displayName: string; avatarUrl: string }): Promise<Learner> {
        return this.learnerRepository.createLearner(data);
    }

    async ensureProfileExists(data: { id: string; email: string; fullName: string }): Promise<void> {
        return this.learnerRepository.ensureProfileExists(data);
    }

    async getLearnersByParentId(parentId: string): Promise<Learner[]> {
        return this.learnerRepository.getLearnersByParentId(parentId);
    }

    async getStudentFrontier(learnerId: string): Promise<any[]> {
        // Delegated to stats repository to preserve abstraction
        return this.statsRepository.getStudentFrontier(learnerId);
    }

    async calculateKnowledgeDelta(learnerId: string): Promise<any[]> {
        const stats = await this.getLearnerFullStats(learnerId);

        // Calculate delta with a more realistic baseline (75% of current)
        return stats.skills.map(s => ({
            category: s.name,
            initial: Math.max(10, Math.round(s.percentage * 0.75)),
            current: s.percentage
        }));
    }
}
