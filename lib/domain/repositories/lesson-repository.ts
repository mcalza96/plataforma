import { Lesson } from '../entities/course';
import { UpsertLessonInput, LessonNode } from '../dtos/course';
import { Submission, Achievement } from '../dtos/learner';


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
     * Get a specific lesson by ID.
     */
    getLessonById(lessonId: string): Promise<Lesson | null>;

    /**
     * Get all lessons for a specific course.
     */
    getLessonsByCourseId(courseId: string): Promise<Lesson[]>;

    /**
     * Get the maximum order value for lessons in a course.
     * Useful for auto-calculating the order of a new lesson.
     */
    getMaxOrder(courseId: string): Promise<number>;

    /**
     * Mark a step as complete for a student in a specific lesson.
     */
    markStepComplete(
        studentId: string,
        lessonId: string,
        completedSteps: number,
        isCompleted: boolean
    ): Promise<void>;

    /**
     * Get submissions for admin review.
     */
    getAdminSubmissions(filter: 'pending' | 'reviewed'): Promise<Submission[]>;

    /**
     * Get submission detail by ID.
     */
    getSubmissionDetail(id: string): Promise<Submission | null>;

    /**
     * Submit a review (feedback + badge + mark as reviewed).
     */
    submitReview(data: {
        submissionId: string;
        studentId: string;
        content: string;
        badgeId?: string | null;
    }): Promise<void>;

    /**
     * Get available badges/achievements.
     */
    getAvailableBadges(): Promise<Achievement[]>;

    /**
     * Get feedback for a student.
     */
    getStudentFeedback(studentId: string): Promise<any[]>;

    /**
     * Get unread feedback count for a student.
     */
    getUnreadFeedbackCount(studentId: string): Promise<number>;

    /**
     * Mark feedback message as read.
     */
    markFeedbackAsRead(messageId: string): Promise<void>;

    /**
     * Create a new submission.
     */
    createSubmission(data: {
        studentId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission>;

    /**
     * Get submissions for a student.
     */
    getStudentSubmissions(studentId: string): Promise<Submission[]>;

    /**
     * Verify if a path of lessons is unlocked for a student.
     */
    checkLessonPath(lessonId: string, studentId: string): Promise<LessonNode[]>;
}
