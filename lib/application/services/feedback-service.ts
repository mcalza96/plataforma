import { ILessonRepository } from '../../domain/repositories/lesson-repository';

/**
 * Service for managing learner feedback
 */
export class FeedbackService {
    constructor(private lessonRepository: ILessonRepository) { }

    async getLearnerFeedback(learnerId: string): Promise<any[]> {
        return this.lessonRepository.getLearnerFeedback(learnerId);
    }

    async getUnreadFeedbackCount(learnerId: string): Promise<number> {
        return this.lessonRepository.getUnreadFeedbackCount(learnerId);
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        return this.lessonRepository.markFeedbackAsRead(messageId);
    }
}
