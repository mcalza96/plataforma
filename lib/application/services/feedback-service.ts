import { ILessonRepository } from '../../domain/repositories/lesson-repository';

/**
 * Service for managing student feedback
 */
export class FeedbackService {
    constructor(private lessonRepository: ILessonRepository) { }

    async getStudentFeedback(studentId: string): Promise<any[]> {
        return this.lessonRepository.getStudentFeedback(studentId);
    }

    async getUnreadFeedbackCount(studentId: string): Promise<number> {
        return this.lessonRepository.getUnreadFeedbackCount(studentId);
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        return this.lessonRepository.markFeedbackAsRead(messageId);
    }
}
