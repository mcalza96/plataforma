import { getCourseService, getLessonService } from './di';
import { LearnerStats } from './domain/course';

export async function getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
    const service = getCourseService();
    return await service.getLearnerFullStats(learnerId);
}

export async function getInstructorFeedback(learnerId: string) {
    const service = getLessonService();
    return await service.getLearnerFeedback(learnerId);
}

export async function getLearnerAchievements(learnerId: string) {
    const service = getCourseService();
    return await service.getLearnerAchievements(learnerId);
}

