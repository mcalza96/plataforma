import { Submission, Achievement } from '../dtos/learner';

export interface ISubmissionRepository {
    createSubmission(data: {
        studentId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission>;

    getStudentSubmissions(studentId: string): Promise<Submission[]>;
    getAdminSubmissions(filter: 'pending' | 'reviewed'): Promise<Submission[]>;
    getSubmissionDetail(id: string): Promise<Submission | null>;
    submitReview(data: {
        submissionId: string;
        studentId: string;
        content: string;
        badgeId?: string | null;
    }): Promise<void>;
    getAvailableBadges(): Promise<Achievement[]>;

    // Feedback specific
    getStudentFeedback(studentId: string): Promise<any[]>;
    getUnreadFeedbackCount(studentId: string): Promise<number>;
    markFeedbackAsRead(messageId: string): Promise<void>;
}
