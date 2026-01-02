import { ISubmissionRepository } from '../../domain/repositories/submission-repository';

/**
 * Service for managing student feedback
 */
export class FeedbackService {
    constructor(private repository: ISubmissionRepository) { }

    async getStudentFeedback(studentId: string): Promise<any[]> {
        return this.repository.getStudentFeedback(studentId);
    }

    async getUnreadFeedbackCount(studentId: string): Promise<number> {
        return this.repository.getUnreadFeedbackCount(studentId);
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        return this.repository.markFeedbackAsRead(messageId);
    }
}
