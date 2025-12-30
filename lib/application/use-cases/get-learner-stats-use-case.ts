import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { LearnerStats } from '../../domain/dtos/learner';

export class GetLearnerStatsUseCase {
    constructor(
        private statsRepository: IStatsRepository,
        private courseReader: ICourseReader
    ) { }

    async execute(learnerId: string): Promise<LearnerStats> {
        // Here we could just call the repository if it still has the logic,
        // or we could combine multiple repository calls and do the business logic here.

        // For demonstration of the plan, I'll keep the repository as the data fetcher
        // but if we were to be sticklers for Clean Architecture, the calculations 
        // like "hoursPracticed = steps * 15" should be here.

        // Let's assume statsRepository.getLearnerFullStats(learnerId) returns the raw data 
        // and we process it here. But since I already implemented it in the repository 
        // for speed, I'll just delegate for now but keep this as the proper entry point.

        return this.statsRepository.getLearnerFullStats(learnerId);
    }
}
