import { ICourseRepository } from '../repositories/course-repository';
import {
    UpsertCourseInput,
    Course,
    FamilyDTO,
    LearnerStats,
    LearnerAchievement,
    Learner
} from '../domain/course';

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

    async getFamilies(userRole: string): Promise<FamilyDTO[]> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden ver la lista de familias.');
        }
        return this.courseRepository.getFamilies();
    }

    async getFamilyById(id: string, userRole: string): Promise<FamilyDTO | null> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden ver el detalle de una familia.');
        }
        return this.courseRepository.getFamilyById(id);
    }

    async updateLearnerLevel(learnerId: string, newLevel: number, userRole: string): Promise<void> {
        if (userRole !== 'admin') {
            throw new Error('Solo los administradores pueden actualizar el nivel de los alumnos.');
        }

        if (newLevel < 1 || newLevel > 10) {
            throw new Error('El nivel debe estar entre 1 y 10.');
        }

        return this.courseRepository.updateLearnerLevel(learnerId, newLevel);
    }

    async updateUserRole(targetUserId: string, targetNewRole: string, currentUserId: string, currentUserRole: string): Promise<void> {
        if (currentUserRole !== 'admin') {
            throw new Error('Solo los administradores pueden cambiar roles.');
        }

        if (currentUserId === targetUserId && targetNewRole !== 'admin') {
            throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
        }

        return this.courseRepository.updateUserRole(targetUserId, targetNewRole);
    }

    async getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
        return this.courseRepository.getLearnerFullStats(learnerId);
    }

    async getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]> {
        return this.courseRepository.getLearnerAchievements(learnerId);
    }

    async createLearner(data: { parentId: string; displayName: string; avatarUrl: string }): Promise<Learner> {
        return this.courseRepository.createLearner(data);
    }

    async ensureProfileExists(data: { id: string; email: string; fullName: string }): Promise<void> {
        return this.courseRepository.ensureProfileExists(data);
    }

    async getLearnersByParentId(parentId: string): Promise<Learner[]> {
        return this.courseRepository.getLearnersByParentId(parentId);
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseRepository.getAllCourses();
    }

    async getGlobalStats() {
        return this.courseRepository.getGlobalStats();
    }

    async getStudentFrontier(learnerId: string): Promise<any[]> {
        const { createClient } = await import('../infrastructure/supabase/supabase-server');
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('get_student_frontier', {
            p_learner_id: learnerId
        });

        if (error) {
            console.error('Error fetching student frontier:', error);
            return [];
        }
        return data as any[];
    }

    async calculateKnowledgeDelta(learnerId: string): Promise<any[]> {
        const stats = await this.getLearnerFullStats(learnerId);

        // Regla de Negocio: El delta se proyecta comparando el estado actual 
        // con la base de nivel inicial estimada (metadata de diagnóstico).
        // Por ahora lo simulamos con un factor del 20% de crecimiento atómico.
        return stats.skills.map(s => ({
            category: s.name,
            initial: Math.max(10, Math.round(s.percentage * 0.75)), // El nivel base es el 75% del actual (mínimo 10%)
            current: s.percentage
        }));
    }
}
