import 'server-only';
import { cache } from 'react';
import { getCourseRepository } from '../di';
import {
    CourseCardDTO,
    CourseDetailDTO,
    Lesson,
    Learner,
    LearnerProgress
} from '../domain/course';

// Re-export types to avoid breaking consumers depending on lib/data/courses.ts
export type {
    CourseCardDTO,
    CourseDetailDTO,
    Lesson as LessonDTO,
    Learner as LearnerDTO,
    LearnerProgress as LearnerProgressDTO
};

/**
 * Fetch all courses with progress for a specific learner.
 * Optimized with React.cache for per-request memoization.
 */
export const getCoursesWithProgress = cache(async (learnerId: string): Promise<CourseCardDTO[]> => {
    const repository = getCourseRepository();
    return repository.getCoursesWithProgress(learnerId);
});

/**
 * Fetch a single course with its lessons and learner progress.
 */
export const getCourseWithLessonsAndProgress = cache(async (courseId: string, learnerId: string): Promise<CourseDetailDTO | null> => {
    const repository = getCourseRepository();
    return repository.getCourseWithLessonsAndProgress(courseId, learnerId);
});

/**
 * Fetch learner profile by ID.
 */
export const getLearnerById = cache(async (learnerId: string): Promise<Learner | null> => {
    const repository = getCourseRepository();
    return repository.getLearnerById(learnerId);
});

/**
 * Fetch the next lesson in the course sequence.
 */
export const getNextLesson = cache(async (courseId: string, currentOrder: number): Promise<Lesson | null> => {
    const repository = getCourseRepository();
    return repository.getNextLesson(courseId, currentOrder);
});

