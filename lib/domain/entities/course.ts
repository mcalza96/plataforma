import { CourseTitle, VideoUrl, LessonOrder } from '../value-objects';

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
