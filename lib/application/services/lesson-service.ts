import { ILessonRepository } from '../../domain/repositories/lesson-repository';
import { ICourseReader } from '../../domain/repositories/course-repository';
import { Lesson } from '../../domain/entities/course';
import { UpsertLessonInput, LessonNode } from '../../domain/dtos/course';
import { AuthGuard } from '../guards/auth-guard';
import { UpsertLessonUseCase } from '../use-cases/upsert-lesson-use-case';

/**
 * Domain service for Lesson operations (Core functionality only).
 * Submission and Feedback management moved to specialized services.
 */
export class LessonService {
    private upsertLessonUC: UpsertLessonUseCase;

    constructor(
        private lessonRepository: ILessonRepository,
        private courseReader?: ICourseReader
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

    async getLessonById(id: string): Promise<Lesson | null> {
        return this.lessonRepository.getLessonById(id);
    }

    async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
        return this.lessonRepository.getLessonsByCourseId(courseId);
    }

    async getAdjacentLessons(courseId: string, currentOrder: number): Promise<{ prev: Lesson | null, next: Lesson | null }> {
        // Business Logic delegated to Course Aggregate Root
        if (this.courseReader) {
            const course = await this.courseReader.getCourseById(courseId);
            if (course) {
                return course.getAdjacentLessons(currentOrder);
            }
        }

        // Fallback to repository if course concept is not fully loaded
        const lessons = await this.lessonRepository.getLessonsByCourseId(courseId);
        const currentIndex = lessons.findIndex((l: Lesson) => l.order === currentOrder);

        return {
            prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
            next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
        };
    }

    async checkLessonPath(lessonId: string, learnerId: string): Promise<LessonNode[]> {
        return this.lessonRepository.checkLessonPath(lessonId, learnerId);
    }

    async markStepComplete(
        learnerId: string,
        lessonId: string,
        completedSteps: number,
        totalSteps: number
    ): Promise<void> {
        const isCompleted = completedSteps >= totalSteps;
        return this.lessonRepository.markStepComplete(
            learnerId,
            lessonId,
            completedSteps,
            isCompleted
        );
    }
}
