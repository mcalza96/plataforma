import { CourseProgressInfo, LearnerProgress } from '../entities/course';

export type CourseDTO = {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    teacher_id: string;
    is_published: boolean;
    created_at?: string;
};

export type LessonDTO = {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    video_url: string;
    download_url: string | null;
    order: number;
    total_steps: number;
    parent_node_id: string | null;
};

export interface LessonNode extends LessonDTO {
    is_unlocked: boolean;
    depth?: number;
    requirements?: LessonNode[];
}

export interface CourseCardDTO {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    progress?: CourseProgressInfo;
}

export interface CourseDetailDTO {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    teacher_id: string;
    is_published: boolean;
    progress?: CourseProgressInfo;
    lessons: LessonDTO[];
    learnerProgress: LearnerProgress[];
}

export type UpsertCourseInput = Partial<CourseDTO>;
export type UpsertLessonInput = Partial<LessonDTO> & { course_id: string };
export type CreateCourseInput = Omit<CourseDTO, 'id' | 'teacher_id'>;

export interface PathNode {
    id: string;
    learner_id: string;
    content_id: string;
    title_override?: string;
    description_override?: string;
    order: number;
    parent_node_id: string | null;
    status: 'locked' | 'available' | 'completed' | 'mastered';
    is_completed: boolean;
    unlocked_at?: string;
}

export interface KnowledgeDelta {
    category: string;
    initial_score: number;
    current_mastery: number;
}
