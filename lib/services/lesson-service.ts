import { ILessonRepository } from '../repositories/lesson-repository';
import { Lesson, UpsertLessonInput, Submission, Achievement, LessonNode } from '../domain/course';
import { AuthGuard } from '../application/guards/auth-guard';
import { UpsertLessonUseCase } from '../application/use-cases/upsert-lesson-use-case';

/**
 * Domain service for Lesson operations.
 * Acts as a Facade for Lesson Use Cases.
 */
export class LessonService {
    private upsertLessonUC: UpsertLessonUseCase;

    constructor(private lessonRepository: ILessonRepository) {
        this.upsertLessonUC = new UpsertLessonUseCase(this.lessonRepository);
    }

    async upsertLesson(data: UpsertLessonInput, userRole: string): Promise<Lesson> {
        AuthGuard.check(userRole, ['admin', 'instructor']);
        return this.upsertLessonUC.execute(data);
    }

    async deleteLesson(lessonId: string, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin', 'instructor']);
        return this.lessonRepository.deleteLesson(lessonId);
    }

    async reorderLessons(courseId: string, lessonIds: string[], userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin', 'instructor']);
        // Simplified for now, but following the same pattern
        for (let i = 0; i < lessonIds.length; i++) {
            // Logic would go here or in a specialized Use Case
        }
    }

    async markStepComplete(
        learnerId: string,
        lessonId: string,
        completedSteps: number,
        totalSteps: number
    ): Promise<void> {
        // Business logic: Determine if the lesson is fully completed
        const isCompleted = completedSteps >= totalSteps;
        return this.lessonRepository.markStepComplete(
            learnerId,
            lessonId,
            completedSteps,
            isCompleted
        );
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

    async getLearnerFeedback(learnerId: string): Promise<any[]> {
        return this.lessonRepository.getLearnerFeedback(learnerId);
    }

    async getUnreadFeedbackCount(learnerId: string): Promise<number> {
        return this.lessonRepository.getUnreadFeedbackCount(learnerId);
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        return this.lessonRepository.markFeedbackAsRead(messageId);
    }

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

    async getLessonById(id: string): Promise<Lesson | null> {
        return this.lessonRepository.getLessonById(id);
    }

    async getAdjacentLessons(courseId: string, currentOrder: number): Promise<{ prev: Lesson | null, next: Lesson | null }> {
        const lessons = await this.lessonRepository.getLessonsByCourseId(courseId);
        const currentIndex = lessons.findIndex(l => l.order === currentOrder);

        return {
            prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
            next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
        };
    }

    async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
        return this.lessonRepository.getLessonsByCourseId(courseId);
    }

    async checkLessonPath(lessonId: string, learnerId: string): Promise<LessonNode[]> {
        return this.lessonRepository.checkLessonPath(lessonId, learnerId);
    }
}
