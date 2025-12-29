import {
    CourseCardDTO,
    CourseDetailDTO,
    Lesson,
    Learner,
    UpsertCourseInput,
    Course,
    FamilyDTO,
    LearnerStats,
    LearnerAchievement
} from '../domain/course';

/**
 * Interface definition for Course repository.
 * Follows the Dependency Inversion Principle.
 */
export interface ICourseRepository {
    /**
     * Fetch all courses with progress for a specific learner.
     */
    getCoursesWithProgress(learnerId: string): Promise<CourseCardDTO[]>;

    /**
     * Fetch a single course with its lessons and learner progress.
     */
    getCourseWithLessonsAndProgress(courseId: string, learnerId: string): Promise<CourseDetailDTO | null>;

    /**
     * Fetch learner profile by ID.
     */
    getLearnerById(learnerId: string): Promise<Learner | null>;

    /**
     * Fetch the next lesson in the course sequence.
     */
    getNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null>;

    /**
     * Fetch course by ID.
     */
    getCourseById(courseId: string): Promise<Course | null>;

    /**
     * Create or update a course.
     */
    upsertCourse(data: UpsertCourseInput): Promise<Course>;

    /**
     * Delete a course.
     */
    deleteCourse(courseId: string): Promise<void>;

    /**
     * Get all families (profiles) with their learners.
     */
    getFamilies(): Promise<FamilyDTO[]>;

    /**
     * Get a specific family by ID.
     */
    getFamilyById(id: string): Promise<FamilyDTO | null>;

    /**
     * Update learner level.
     */
    updateLearnerLevel(learnerId: string, newLevel: number): Promise<void>;

    /**
     * Update user role.
     */
    updateUserRole(userId: string, newRole: string): Promise<void>;

    /**
     * Get full stats for a learner.
     */
    getLearnerFullStats(learnerId: string): Promise<LearnerStats>;

    /**
     * Get achievements for a learner.
     */
    getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]>;

    /**
     * Create a new learner.
     */
    createLearner(data: {
        parentId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Learner>;

    /**
     * Ensure a parent profile exists.
     */
    ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void>;

    /**
     * Get all learners for a specific parent.
     */
    getLearnersByParentId(parentId: string): Promise<Learner[]>;

    /**
     * Get all courses (admin view).
     */
    getAllCourses(): Promise<Course[]>;

    /**
     * Get global stats for admin.
     */
    getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }>;
}
