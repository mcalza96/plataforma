import { Lesson, UpsertLessonInput, Submission, Achievement, LessonNode } from '../domain/course';

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

    /**
     * Mark a step as complete for a learner in a specific lesson.
     */
    markStepComplete(
        learnerId: string,
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
        learnerId: string;
        content: string;
        badgeId?: string | null;
    }): Promise<void>;

    /**
     * Get available badges/achievements.
     */
    getAvailableBadges(): Promise<Achievement[]>;

    /**
     * Get feedback for a learner.
     */
    getLearnerFeedback(learnerId: string): Promise<any[]>;

    /**
     * Get unread feedback count for a learner.
     */
    getUnreadFeedbackCount(learnerId: string): Promise<number>;

    /**
     * Mark feedback message as read.
     */
    markFeedbackAsRead(messageId: string): Promise<void>;

    /**
     * Create a new submission.
     */
    createSubmission(data: {
        learnerId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission>;

    /**
     * Get submissions for a learner.
     */
    getLearnerSubmissions(learnerId: string): Promise<Submission[]>;

    /**
     * Verify if a path of lessons is unlocked for a learner.
     */
    checkLessonPath(lessonId: string, learnerId: string): Promise<LessonNode[]>;
}
