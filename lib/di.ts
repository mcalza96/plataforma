import { SupabaseCourseRepository } from './infrastructure/supabase/supabase-course-repository';
import { SupabaseLessonRepository } from './infrastructure/supabase/supabase-lesson-repository';
import { ICourseRepository } from './repositories/course-repository';
import { ILessonRepository } from './repositories/lesson-repository';
import { CourseService } from './services/course-service';
import { LessonService } from './services/lesson-service';

/**
 * Dependency Injection container / Service Locator.
 * Provides instances of our repositories and services.
 */

let courseRepository: ICourseRepository | null = null;
let lessonRepository: ILessonRepository | null = null;
let courseService: CourseService | null = null;
let lessonService: LessonService | null = null;

/**
 * Singleton instance of the Course Repository.
 */
export function getCourseRepository(): ICourseRepository {
    if (!courseRepository) {
        courseRepository = new SupabaseCourseRepository();
    }
    return courseRepository;
}

/**
 * Singleton instance of the Lesson Repository.
 */
export function getLessonRepository(): ILessonRepository {
    if (!lessonRepository) {
        lessonRepository = new SupabaseLessonRepository();
    }
    return lessonRepository;
}

/**
 * Singleton instance of the Course Service.
 */
export function getCourseService(): CourseService {
    if (!courseService) {
        courseService = new CourseService(getCourseRepository());
    }
    return courseService;
}

/**
 * Singleton instance of the Lesson Service.
 */
export function getLessonService(): LessonService {
    if (!lessonService) {
        lessonService = new LessonService(getLessonRepository());
    }
    return lessonService;
}
