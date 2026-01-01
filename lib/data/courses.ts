import 'server-only';
import { cache } from 'react';
import { getCourseReader, getLearnerRepository } from '@/lib/infrastructure/di';
import {
    CourseCardDTO,
    CourseDetailDTO,
    LessonDTO as Lesson,
    Learner,
    LearnerProgress
} from '@/lib/domain/course';

// Loaders only below. Types are imported from @/lib/domain/course.


/**
 * Fetch all courses with progress for a specific learner.
 * Optimized with React.cache for per-request memoization.
 */
export const getCoursesWithProgress = cache(async (learnerId: string): Promise<CourseCardDTO[]> => {
    const repository = getCourseReader();
    return repository.getCoursesWithProgress(learnerId);
});

/**
 * Fetch a single course with its lessons and learner progress.
 */
export const getCourseWithLessonsAndProgress = cache(async (courseId: string, learnerId: string): Promise<CourseDetailDTO | null> => {
    const repository = getCourseReader();
    return repository.getCourseWithLessonsAndProgress(courseId, learnerId);
});

/**
 * Fetch learner profile by ID.
 */
export const getLearnerById = cache(async (learnerId: string): Promise<Learner | null> => {
    const repository = getLearnerRepository();
    return repository.getLearnerById(learnerId);
});

/**
 * Fetch the next lesson in the course sequence.
 */
export const getNextLesson = cache(async (courseId: string, currentOrder: number): Promise<Lesson | null> => {
    const repository = getCourseReader();
    return repository.getNextLesson(courseId, currentOrder);
});

