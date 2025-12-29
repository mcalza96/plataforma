import { ILessonRepository } from '../repositories/lesson-repository';
import { Lesson, UpsertLessonInput, Submission, Achievement } from '../domain/course';

/**
 * Domain service for Lesson operations.
 */
export class LessonService {
    constructor(private lessonRepository: ILessonRepository) { }

    async upsertLesson(data: UpsertLessonInput, userRole: string): Promise<Lesson> {
        // Regla de negocio: Validar permisos
        if (userRole !== 'admin' && userRole !== 'instructor') {
            throw new Error('No tienes permisos para gestionar fases (lecciones).');
        }

        // Regla de negocio: Autocalcular el orden si es una lección nueva y no se provee orden
        // En este caso, el repo actual lo pide, pero podemos hacerlo opcional en el servicio
        if (!data.id && (!data.order || data.order === 0)) {
            const maxOrder = await this.lessonRepository.getMaxOrder(data.course_id);
            data.order = maxOrder + 1;
        }

        return this.lessonRepository.upsertLesson(data);
    }

    async deleteLesson(lessonId: string, userRole: string): Promise<void> {
        if (userRole !== 'admin' && userRole !== 'instructor') {
            throw new Error('No tienes permisos para eliminar fases.');
        }

        return this.lessonRepository.deleteLesson(lessonId);
    }

    async reorderLessons(courseId: string, lessonIds: string[], userRole: string): Promise<void> {
        if (userRole !== 'admin' && userRole !== 'instructor') {
            throw new Error('No tienes permisos para reordenar fases.');
        }

        // Implementación de reordenamiento masivo
        // Podríamos iterar y actualizar cada una, o tener un método en el repo
        for (let i = 0; i < lessonIds.length; i++) {
            // Nota: Esto es un poco ineficiente, en producción usaríamos una RPC o update masivo
            const id = lessonIds[i];
            // Aquí necesitaríamos obtener la lección primero o tener un upsert parcial
            // Por simplicidad en este sprint, asumimos que el repo maneja el orden
        }
    }

    async markStepComplete(
        learnerId: string,
        lessonId: string,
        completedSteps: number,
        totalSteps: number
    ): Promise<void> {
        // Business logic: Determine if the lesson is fully completed
        const isCompleted = completedSteps >= totalSteps;

        return this.lessonRepository.markStepComplete(
            learnerId,
            lessonId,
            completedSteps,
            isCompleted
        );
    }

    async getAdminSubmissions(filter: 'pending' | 'reviewed', userRole: string): Promise<Submission[]> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden revisar entregas.');
        }
        return this.lessonRepository.getAdminSubmissions(filter);
    }

    async getSubmissionDetail(id: string, userRole: string): Promise<Submission | null> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden ver el detalle de entregas.');
        }
        return this.lessonRepository.getSubmissionDetail(id);
    }

    async submitReview(data: {
        submissionId: string;
        learnerId: string;
        content: string;
        badgeId?: string | null;
    }, userRole: string): Promise<void> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden enviar revisiones.');
        }
        return this.lessonRepository.submitReview(data);
    }

    async getAvailableBadges(): Promise<Achievement[]> {
        return this.lessonRepository.getAvailableBadges();
    }

    async getLearnerFeedback(learnerId: string): Promise<any[]> {
        return this.lessonRepository.getLearnerFeedback(learnerId);
    }

    async getUnreadFeedbackCount(learnerId: string): Promise<number> {
        return this.lessonRepository.getUnreadFeedbackCount(learnerId);
    }

    async markFeedbackAsRead(messageId: string): Promise<void> {
        return this.lessonRepository.markFeedbackAsRead(messageId);
    }

    async createSubmission(data: {
        learnerId: string;
        lessonId: string | null;
        title: string;
        fileUrl: string;
        category: string;
    }): Promise<Submission> {
        return this.lessonRepository.createSubmission(data);
    }

    async getLearnerSubmissions(learnerId: string): Promise<Submission[]> {
        return this.lessonRepository.getLearnerSubmissions(learnerId);
    }

    async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
        return this.lessonRepository.getLessonsByCourseId(courseId);
    }
}
