/**
 * Domain interfaces for the Course module.
 * These are clean interfaces used by the UI and the Domain layer.
 */

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    created_at?: string;
}

export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    video_url: string;
    download_url: string | null;
    order: number;
    total_steps: number;
}

export interface LearnerProgress {
    id: string;
    learner_id: string;
    lesson_id: string;
    completed_steps: number;
    is_completed: boolean;
}

export interface CourseProgressInfo {
    completed_steps: number;
    total_steps: number;
    is_completed: boolean;
}

export interface CourseCardDTO extends Course {
    progress?: CourseProgressInfo;
}

export interface CourseDetailDTO extends CourseCardDTO {
    lessons: Lesson[];
    learnerProgress: LearnerProgress[];
}

export interface Learner {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
}

export interface UpsertCourseInput {
    id?: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    level_required: number;
    category: string;
    is_published?: boolean;
}

export interface UpsertLessonInput {
    id?: string;
    course_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    video_url: string;
    download_url?: string;
    total_steps: number;
    order: number;
}

export interface CreateCourseInput {
    title: string;
    description: string;
    thumbnail_url?: string;
    level_required: number;
    category: string;
}
