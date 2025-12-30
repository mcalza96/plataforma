import { ILessonRepository } from '../../domain/repositories/lesson-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { Lesson } from '../../domain/entities/course';
import { UpsertLessonInput, LessonNode } from '../../domain/dtos/course';
import { Submission, Achievement } from '../../domain/dtos/learner';
import { AuthGuard } from '../guards/auth-guard';
import { UpsertLessonUseCase } from '../use-cases/upsert-lesson-use-case';


/**
 * Domain service for Lesson operations.
 * Acts as a Facade for Lesson Use Cases.
 */
export class LessonService {
    private upsertLessonUC: UpsertLessonUseCase;

    constructor(
        private lessonRepository: ILessonRepository,
        private courseReader?: ICourseReader // Made optional to avoid breaking DI if not provided immediately
    ) {
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
        // Business logic delegated to Domain: 
        // We create a temporary lesson object or use the logic directly
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
        // Business Logic delegated to Course Aggregate Root
        if (this.courseReader) {
            const course = await this.courseReader.getCourseById(courseId);
            if (course) {
                // Course Entity now has this logic
                return course.getAdjacentLessons(currentOrder);
            }
        }

        // Fallback to repository if course concept is not fully loaded
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
