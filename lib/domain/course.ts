import { z } from 'zod';
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

    /**
     * Checks if this lesson is the start of a course (no prerequisites)
     */
    public isInitialLesson(): boolean {
        return this.parent_node_id === null;
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

        if (this._lessons.length === 0) {
            throw new Error('Un curso sin lecciones no puede ser publicado');
        }

        this.is_published = true;
    }

    public unpublish(): void {
        this.is_published = false;
    }

    /**
     * Calculates the overall progress of the course based on learner progress records.
     */
    public calculateProgress(learnerProgress: LearnerProgress[]): CourseProgressInfo {
        const completedSteps = learnerProgress.reduce((sum, p) => sum + p.completed_steps, 0);
        const totalSteps = this._lessons.reduce((sum, l) => sum + l.total_steps, 0);
        const isCompleted = learnerProgress.length === this._lessons.length && learnerProgress.every(p => p.is_completed);

        return {
            completed_steps: completedSteps,
            total_steps: totalSteps,
            is_completed: isCompleted
        };
    }

    /**
     * Finds previous and next lessons based on the current order.
     */
    public getAdjacentLessons(currentOrder: number): { prev: Lesson | null, next: Lesson | null } {
        const sorted = this.lessons;
        const currentIndex = sorted.findIndex(l => l.order === currentOrder);

        return {
            prev: currentIndex > 0 ? sorted[currentIndex - 1] : null,
            next: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null
        };
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

/**
 * Learner Entity - Rich Domain Model
 */
export class Learner {
    constructor(
        public readonly id: string,
        public readonly parent_id: string,
        public display_name: string,
        public level: number,
        public avatar_url?: string
    ) { }

    /**
     * Business Rule: Check if the learner has enough level to access a course.
     */
    public canAccess(course: Course): boolean {
        return this.level >= course.level_required;
    }

    /**
     * Business Rule: Upgrades learner level with validation.
     */
    public upgradeLevel(newLevel: number): void {
        if (newLevel < 1 || newLevel > 10) {
            throw new Error('El nivel debe estar entre 1 y 10.');
        }
        if (newLevel <= this.level) {
            return; // Only upgrades allowed
        }
        this.level = newLevel;
    }
}

export type LearnerDTO = {
    id: string;
    display_name: string;
    level: number;
    avatar_url?: string;
};

export type LearnerProgressDTO = LearnerProgress;

/**
 * Profile Entity - Rich Domain Model
 */
export class Profile {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public full_name: string | null,
        public role: string
    ) { }

    public isAdmin(): boolean {
        return this.role === 'admin';
    }

    public isInstructor(): boolean {
        return this.role === 'instructor' || this.role === 'admin';
    }

    public isFamily(): boolean {
        return this.role === 'family';
    }
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

// --- Domain Schemas (Zod) ---

export const CourseSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(5, 'El título debe ser más inspirador (mín. 5 caracteres)'),
    description: z.string().min(20, 'Describe mejor la misión para motivar a los alumnos (mín. 20 caracteres)'),
    level_required: z.coerce.number().min(1, 'Nivel mín. 1').max(10, 'Nivel máx. 10'),
    category: z.string().min(1, 'Selecciona una categoría para el estudio'),
    thumbnail_url: z.string().url('URL de miniatura inválida').optional().or(z.literal('')),
    is_published: z.boolean().optional(),
    teacher_id: z.string().uuid('ID de maestro inválido').optional(),
});

export const LessonSchema = z.object({
    id: z.string().uuid().optional(),
    course_id: z.string().uuid('ID de misión inválido'),
    title: z.string().min(5, 'El título de la fase es muy corto (mín. 5 caracteres)'),
    video_url: z.string().url('Necesitamos una URL de video (MP4/Loom) válida'),
    description: z.string().optional().or(z.literal('')),
    thumbnail_url: z.string().url('URL de miniatura inválida').optional().or(z.literal('')),
    download_url: z.string().url('Formato de link de recursos inválido').optional().or(z.literal('')),
    total_steps: z.coerce.number().min(1, 'Mínimo 1 paso LEGO').max(20, 'Máximo 20 pasos LEGO'),
    order: z.coerce.number().min(1, 'El orden debe ser positivo'),
    parent_node_id: z.string().uuid('ID de fase previa inválido').optional().nullable(),
});

export const ALOSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(5, 'El título del objeto de aprendizaje es muy corto (mín. 5 caracteres)'),
    description: z.string().min(10, 'Añade una descripción pedagógica (mín. 10 caracteres)'),
    type: z.union([z.literal('video'), z.literal('quiz'), z.literal('text')]),
    payload: z.record(z.string(), z.any()).refine((val) => val !== null, "El payload no puede ser nulo"),
    metadata: z.object({
        bloom_level: z.string(),
        estimated_duration: z.coerce.number().optional(),
        skills: z.array(z.string()),
    }).optional(),
    is_public: z.boolean().optional(),
}).refine((data) => {
    if (data.type === 'video') {
        return !!data.payload.url && typeof data.payload.url === 'string';
    }
    if (data.type === 'quiz') {
        return Array.isArray(data.payload.questions) && data.payload.questions.length > 0;
    }
    if (data.type === 'text') {
        return !!data.payload.content && typeof data.payload.content === 'string';
    }
    return true;
}, {
    message: "El payload no coincide con el tipo de contenido seleccionado",
    path: ["payload"]
});

export const FeedbackSchema = z.object({
    submissionId: z.string().uuid(),
    learnerId: z.string().uuid(),
    content: z.string().min(10, 'El feedback debe ser constructivo (min 10 caracteres)'),
    badgeId: z.string().uuid().optional().nullable(),
});
