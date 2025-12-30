import { CourseTitle, VideoUrl, LessonOrder } from './value-objects';

export enum BloomLevel {
    RECUERDO = 'Recordar',
    COMPRENSION = 'Comprender',
    APLICACION = 'Aplicar',
    ANALISIS = 'Analizar',
    EVALUACION = 'Evaluar',
    CREACION = 'Crear'
}

/**
 * Lesson Entity
 */
export class Lesson {
    constructor(
        public readonly id: string,
        public readonly course_id: string,
        public title: string,
        public description: string | null,
        public thumbnail_url: string | null,
        public video_url: string,
        public download_url: string | null,
        public order: number,
        public total_steps: number,
        public parent_node_id: string | null = null
    ) {
        // Validation using Value Objects internally or simple checks
        new VideoUrl(video_url);
        new LessonOrder(order);
    }

    /**
     * Business logic to complete a step and determine if the lesson is finished.
     */
    public completeStep(currentCompletedSteps: number): boolean {
        if (currentCompletedSteps < 0 || currentCompletedSteps > this.total_steps) {
            throw new Error('Número de pasos completados inválido');
        }
        return currentCompletedSteps >= this.total_steps;
    }
}

/**
 * Course Entity - Aggregate Root
 */
export class Course {
    private _lessons: Lesson[] = [];

    constructor(
        public readonly id: string,
        public title: string,
        public description: string,
        public thumbnail_url: string,
        public level_required: number,
        public category: string,
        public teacher_id: string,
        public is_published: boolean = false,
        public created_at?: string
    ) {
        // Essential domain validation
        new CourseTitle(title);
        if (description.length < 20) {
            throw new Error('Describe mejor la misión para motivar a los alumnos (mín. 20 caracteres)');
        }
    }

    public get lessons(): ReadonlyArray<Lesson> {
        return [...this._lessons].sort((a, b) => a.order - b.order);
    }

    /**
     * Aggregate Root manages its children to maintain consistency
     */
    public addLesson(lesson: Lesson): void {
        if (lesson.course_id !== this.id) {
            throw new Error('La lección no pertenece a este curso');
        }
        this._lessons.push(lesson);
    }

    /**
     * Business logic moved from services to Domain
     */
    public publish(): void {
        if (!this.title || this.description.length < 20) {
            throw new Error('La misión debe tener un título y una descripción detallada para ser publicada.');
        }

        // Future rule: Check if it has at least one lesson
        // if (this._lessons.length === 0) throw new Error('Un curso sin lecciones no puede ser publicado');

        this.is_published = true;
    }

    public unpublish(): void {
        this.is_published = false;
    }
}

// --- DTOs and Logic Aliases for Infrastructure/UI compatibility ---
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

export interface Learner {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
}

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

export type UpsertCourseInput = Partial<CourseDTO>;
export type UpsertLessonInput = Partial<LessonDTO> & { course_id: string }; // course_id is usually required for new ones
export type CreateCourseInput = Omit<CourseDTO, 'id' | 'teacher_id'>;

// --- Path Nodes & Others ---

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
// --- Content Library (Brickyard) ---

export type AtomicLearningObject = {
    id: string;
    title: string;
    description: string;
    type: string;
    content_url: string;
    metadata: {
        bloom_level: BloomLevel;
        estimated_duration?: number;
        skills: string[];
    };
    created_by: string;
    created_at: string;
};
