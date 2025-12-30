import { getLearnerService, getLessonService } from './di';
import { LearnerStats } from './domain/dtos/learner';

export async function getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
    const service = getLearnerService();
    return await service.getLearnerFullStats(learnerId);
}

export async function getInstructorFeedback(learnerId: string) {
    const service = getLessonService();
    return await service.getLearnerFeedback(learnerId);
}

export async function getLearnerAchievements(learnerId: string) {
    const service = getLearnerService();
    return await service.getLearnerAchievements(learnerId);
}

export async function getKnowledgeDelta(learnerId: string) {
    const service = getLearnerService();
    return await service.calculateKnowledgeDelta(learnerId);
}

export async function getLearningFrontier(learnerId: string) {
    const service = getLearnerService();
    return await service.getStudentFrontier(learnerId);
}


