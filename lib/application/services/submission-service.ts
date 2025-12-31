import { ILessonRepository } from '../../domain/repositories/lesson-repository';
import { Submission, Achievement } from '../../domain/dtos/learner';
import { AuthGuard } from '../guards/auth-guard';

/**
 * Service for managing learner submissions and reviews
 */
export class SubmissionService {
    constructor(private lessonRepository: ILessonRepository) { }

    async createSubmission(data: {
        learnerId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission> {
        return this.lessonRepository.createSubmission(data);
    }

    async getLearnerSubmissions(learnerId: string): Promise<Submission[]> {
        return this.lessonRepository.getLearnerSubmissions(learnerId);
    }

    async getAdminSubmissions(filter: 'pending' | 'reviewed', userRole: string): Promise<Submission[]> {
        AuthGuard.check(userRole, ['admin']);
        return this.lessonRepository.getAdminSubmissions(filter);
    }

    async getSubmissionDetail(id: string, userRole: string): Promise<Submission | null> {
        AuthGuard.check(userRole, ['admin']);
        return this.lessonRepository.getSubmissionDetail(id);
    }

    async submitReview(data: {
        submissionId: string;
        learnerId: string;
        content: string;
        badgeId?: string | null;
    }, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin']);
        return this.lessonRepository.submitReview(data);
    }

    async getAvailableBadges(): Promise<Achievement[]> {
        return this.lessonRepository.getAvailableBadges();
    }
}
