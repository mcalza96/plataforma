import 'server-only';
import { cache } from 'react';
import { getCourseReader, getStudentRepository } from '@/lib/infrastructure/di';
import {
    CourseCardDTO,
    CourseDetailDTO,
    LessonDTO as Lesson
} from '@/lib/domain/course';
import { Student } from '@/lib/domain/entities/learner';

// Loaders only below. Types are imported from @/lib/domain/course.


/**
 * Fetch all courses with progress for a specific student.
 * Optimized with React.cache for per-request memoization.
 */
export const getCoursesWithProgress = cache(async (studentId: string): Promise<CourseCardDTO[]> => {
    const repository = getCourseReader();
    return repository.getCoursesWithProgress(studentId);
});

/**
 * Fetch a single course with its lessons and student progress.
 */
export const getCourseWithLessonsAndProgress = cache(async (courseId: string, studentId: string): Promise<CourseDetailDTO | null> => {
    const repository = getCourseReader();
    return repository.getCourseWithLessonsAndProgress(courseId, studentId);
});

/**
 * Fetch student profile by ID.
 */
export const getStudentById = cache(async (studentId: string): Promise<Student | null> => {
    const repository = getStudentRepository();
    return repository.getStudentById(studentId);
});

/**
 * Fetch the next lesson in the course sequence.
 */
export const getNextLesson = cache(async (courseId: string, currentOrder: number): Promise<Lesson | null> => {
    const repository = getCourseReader();
    return repository.getNextLesson(courseId, currentOrder);
});
