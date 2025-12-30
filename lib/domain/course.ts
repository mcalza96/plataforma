/**
 * Domain interfaces for the Course module.
 * These are clean interfaces used by the UI and the Domain layer.
 */

export enum BloomLevel {
    RECUERDO = 'Recordar',
    COMPRENSION = 'Comprender',
    APLICACION = 'Aplicar',
    ANALISIS = 'Analizar',
    EVALUACION = 'Evaluar',
    CREACION = 'Crear'
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level_required: number;
    category: string;
    teacher_id: string; // ID of the instructor (profile_id)
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
    parent_node_id: string | null; // For DAG structure
}

/**
 * DTO for a Lesson in the DAG (Graph representation)
 */
export interface LessonNode extends Lesson {
    is_unlocked: boolean;
    depth?: number;
    requirements?: LessonNode[]; // Adjacent nodes
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
    teacher_id?: string;
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
    parent_node_id?: string | null;
}

export interface CreateCourseInput {
    title: string;
    description: string;
    thumbnail_url?: string;
    level_required: number;
    category: string;
}

// --- Content Library (Brickyard) ---

export interface AtomicLearningObject {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'quiz' | 'text';
    payload: any;
    metadata: {
        bloom_level: BloomLevel;
        estimated_duration?: number;
        skills: string[];
    };
    is_public: boolean;
    created_by: string;
    created_at: string;
}

export interface CreateALOInput {
    title: string;
    description: string;
    type: 'video' | 'quiz' | 'text';
    payload: any;
    metadata?: Partial<AtomicLearningObject['metadata']>;
    is_public?: boolean;
}

// --- Path Nodes (Customized Learning Paths) ---

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

export interface CustomPathCommitInput {
    learner_id: string;
    modules: {
        content_id: string;
        order: number;
        title_override?: string;
        description_override?: string;
        has_custom_edits: boolean;
        original_alo: AtomicLearningObject;
    }[];
}
