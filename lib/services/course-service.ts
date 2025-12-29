import { ICourseRepository } from '../repositories/course-repository';
import { UpsertCourseInput, Course } from '../domain/course';

/**
 * Domain service for Course operations.
 * Encapsulates business logic and rules.
 */
export class CourseService {
    constructor(private courseRepository: ICourseRepository) { }

    async createOrUpdateCourse(data: UpsertCourseInput, userRole: string): Promise<Course> {
        // Regla de negocio: Solo admin o instructor pueden gestionar cursos
        if (userRole !== 'admin' && userRole !== 'instructor') {
            throw new Error('No tienes permisos suficientes para gestionar misiones.');
        }

        // Regla de negocio: Si se intenta publicar, verificar contenido mínimo
        if (data.is_published) {
            if (!data.title || data.description.length < 20) {
                throw new Error('La misión debe tener un título y una descripción detallada para ser publicada.');
            }
            // Placeholder para verificar si tiene lecciones en el futuro
        }

        return this.courseRepository.upsertCourse(data);
    }

    async deleteCourse(id: string, userRole: string): Promise<void> {
        // Regla de negocio: Solo el admin puede eliminar cursos
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden eliminar misiones del sistema.');
        }

        return this.courseRepository.deleteCourse(id);
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.courseRepository.getCourseById(id);
    }
}
