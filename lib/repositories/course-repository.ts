import {
    CourseCardDTO,
    CourseDetailDTO,
    LessonDTO,
    CourseDTO,
    Learner,
    UpsertCourseInput,
    FamilyDTO,
    LearnerStats,
    LearnerAchievement,
    Course,
    Lesson
} from '../domain/course';

/**
 * Segregated Interfaces for Course Operations (ISP)
 */

export interface ICourseReader {
    getCoursesWithProgress(learnerId: string): Promise<CourseCardDTO[]>;
    getCourseWithLessonsAndProgress(courseId: string, learnerId: string): Promise<CourseDetailDTO | null>;
    getNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null>;
    getCourseById(courseId: string): Promise<Course | null>;
    getAllCourses(): Promise<Course[]>;
}

export interface ICourseWriter {
    upsertCourse(data: UpsertCourseInput): Promise<Course>;
    deleteCourse(courseId: string): Promise<void>;
}

export interface ILearnerRepository {
    getLearnerById(learnerId: string): Promise<Learner | null>;
    getFamilies(): Promise<FamilyDTO[]>;
    getFamilyById(id: string): Promise<FamilyDTO | null>;
    updateLearnerLevel(learnerId: string, newLevel: number): Promise<void>;
    updateUserRole(userId: string, newRole: string): Promise<void>;
    createLearner(data: {
        parentId: string;
        displayName: string;
        avatarUrl: string;
    }): Promise<Learner>;
    ensureProfileExists(data: {
        id: string;
        email: string;
        fullName: string;
    }): Promise<void>;
    getLearnersByParentId(parentId: string): Promise<Learner[]>;
}

export interface IStatsRepository {
    getLearnerFullStats(learnerId: string): Promise<LearnerStats>;
    getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]>;
    getGlobalStats(): Promise<{
        totalLearners: number;
        totalSubmissions: number;
        totalCourses: number;
    }>;
}

// Legacy alias for backward compatibility during transition if needed
export interface ICourseRepository extends ICourseReader, ICourseWriter, ILearnerRepository, IStatsRepository { }
