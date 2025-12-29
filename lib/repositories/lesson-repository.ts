import { Lesson, UpsertLessonInput } from '../domain/course';

/**
 * Interface definition for Lesson repository.
 */
export interface ILessonRepository {
    /**
     * Create or update a lesson.
     */
    upsertLesson(data: UpsertLessonInput): Promise<Lesson>;

    /**
     * Delete a lesson.
     */
    deleteLesson(lessonId: string): Promise<void>;

    /**
     * Get all lessons for a specific course.
     */
    getLessonsByCourseId(courseId: string): Promise<Lesson[]>;

    /**
     * Get the maximum order value for lessons in a course.
     * Useful for auto-calculating the order of a new lesson.
     */
    getMaxOrder(courseId: string): Promise<number>;
}
