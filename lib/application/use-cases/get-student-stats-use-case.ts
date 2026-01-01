import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { StudentStats } from '../../domain/dtos/learner';

export class GetStudentStatsUseCase {
    constructor(
        private statsRepository: IStatsRepository,
        private courseReader: ICourseReader
    ) { }

    async execute(studentId: string): Promise<StudentStats> {
        return this.statsRepository.getStudentFullStats(studentId);
    }
}
