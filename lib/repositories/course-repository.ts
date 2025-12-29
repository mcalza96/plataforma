import {
    CourseCardDTO,
    CourseDetailDTO,
    Lesson,
    Learner,
    UpsertCourseInput,
    Course
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
}
