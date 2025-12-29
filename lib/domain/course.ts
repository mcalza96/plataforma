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
    is_published?: boolean;
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

// --- DTO Aliases for easier consumption ---
export type LessonDTO = Lesson;
export type LearnerDTO = Learner;
export type LearnerProgressDTO = LearnerProgress;


export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
}

export interface FamilyDTO extends Profile {
    learners: Learner[];
}

export interface Submission {
    id: string;
    learner_id: string;
    lesson_id: string | null;
    title: string;
    file_url: string;
    category: string;
    is_reviewed: boolean;
    created_at: string;
    lessons?: { title: string };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_url: string;
}

export interface LearnerAchievement {
    unlocked_at: string;
    achievements: Achievement;
}

export interface LearnerStats {
    totalProjects: number;
    hoursPracticed: number;
    completedLections: number;
    skills: { name: string; percentage: number; color: string }[];
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
