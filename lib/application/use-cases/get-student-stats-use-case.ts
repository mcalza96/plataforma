import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { StudentStats } from '../../domain/dtos/learner';

export class GetStudentStatsUseCase {
    constructor(
        private statsRepository: IStatsRepository
    ) { }

    async execute(studentId: string): Promise<StudentStats> {
        return this.statsRepository.getStudentFullStats(studentId);
    }
}
