import { Course, Lesson } from '../entities/course';
import {
    CourseCardDTO,
    CourseDetailDTO,
    UpsertCourseInput,
} from '../dtos/course';

/**
 * Segregated Interfaces for Course Operations (ISP)
 */

export interface ICourseReader {
    getCoursesWithProgress(studentId: string): Promise<CourseCardDTO[]>;
    getCourseWithLessonsAndProgress(courseId: string, studentId: string): Promise<CourseDetailDTO | null>;
    getNextLesson(courseId: string, currentOrder: number): Promise<Lesson | null>;
    getCourseById(courseId: string): Promise<Course | null>;
    getAllCourses(): Promise<Course[]>;
}

export interface ICourseWriter {
    upsertCourse(data: UpsertCourseInput): Promise<Course>;
    deleteCourse(courseId: string): Promise<void>;
}
