import { ISubmissionRepository } from '../../domain/repositories/submission-repository';
import { Submission, Achievement } from '../../domain/dtos/learner';
import { AuthGuard } from '../guards/auth-guard';

/**
 * Service for managing student submissions and reviews
 */
export class SubmissionService {
    constructor(private repository: ISubmissionRepository) { }

    async createSubmission(data: {
        studentId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission> {
        return this.repository.createSubmission(data);
    }

    async getStudentSubmissions(studentId: string): Promise<Submission[]> {
        return this.repository.getStudentSubmissions(studentId);
    }

    async getAdminSubmissions(filter: 'pending' | 'reviewed', userRole: string): Promise<Submission[]> {
        AuthGuard.check(userRole, ['admin', 'instructor', 'teacher']);
        return this.repository.getAdminSubmissions(filter);
    }

    async getSubmissionDetail(id: string, userRole: string): Promise<Submission | null> {
        AuthGuard.check(userRole, ['admin', 'instructor', 'teacher']);
        return this.repository.getSubmissionDetail(id);
    }

    async submitReview(data: {
        submissionId: string;
        studentId: string;
        content: string;
        badgeId?: string | null;
    }, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin', 'instructor', 'teacher']);
        return this.repository.submitReview(data);
    }

    async getAvailableBadges(): Promise<Achievement[]> {
        return this.repository.getAvailableBadges();
    }
}
