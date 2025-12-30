import {
    ICourseReader,
    ICourseWriter,
    ILearnerRepository,
    IStatsRepository
} from '../repositories/course-repository';
import {
    UpsertCourseInput,
    Course,
    FamilyDTO,
    LearnerStats,
    LearnerAchievement,
    Learner
} from '../domain/course';
import { AuthGuard } from '../application/guards/auth-guard';
import { SaveCourseUseCase } from '../application/use-cases/save-course-use-case';
import { PublishCourseUseCase } from '../application/use-cases/publish-course-use-case';

/**
 * Domain service for Course operations.
 * Acts as a Facade for Application Use Cases.
 */
export class CourseService {
    private saveCourseUC: SaveCourseUseCase;
    private publishCourseUC: PublishCourseUseCase;

    constructor(
        private courseReader: ICourseReader,
        private courseWriter: ICourseWriter,
        private learnerRepository: ILearnerRepository,
        private statsRepository: IStatsRepository
    ) {
        this.saveCourseUC = new SaveCourseUseCase(this.courseWriter);
        this.publishCourseUC = new PublishCourseUseCase(this.courseReader, this.courseWriter);
    }

    async createOrUpdateCourse(data: UpsertCourseInput, userRole: string): Promise<Course> {
        AuthGuard.check(userRole, ['admin', 'instructor']);
        return this.saveCourseUC.execute(data);
    }

    async deleteCourse(id: string, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin']);
        return this.courseWriter.deleteCourse(id);
    }

    async publishCourse(courseId: string, userId: string, userRole: string): Promise<void> {
        // AuthGuard check is inside the UseCase as it also checks ownership
        return this.publishCourseUC.execute({ courseId, userId, userRole });
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.courseReader.getCourseById(id);
    }

    async getFamilies(userRole: string): Promise<FamilyDTO[]> {
        AuthGuard.check(userRole, ['admin']);
        return this.learnerRepository.getFamilies();
    }

    async getFamilyById(id: string, userRole: string): Promise<FamilyDTO | null> {
        AuthGuard.check(userRole, ['admin']);
        return this.learnerRepository.getFamilyById(id);
    }

    async updateLearnerLevel(learnerId: string, newLevel: number, userRole: string): Promise<void> {
        AuthGuard.check(userRole, ['admin']);
        if (newLevel < 1 || newLevel > 10) {
            throw new Error('El nivel debe estar entre 1 y 10.');
        }
        return this.learnerRepository.updateLearnerLevel(learnerId, newLevel);
    }

    async updateUserRole(targetUserId: string, targetNewRole: string, currentUserId: string, currentUserRole: string): Promise<void> {
        AuthGuard.check(currentUserRole, ['admin']);
        if (currentUserId === targetUserId && targetNewRole !== 'admin') {
            throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
        }
        return this.learnerRepository.updateUserRole(targetUserId, targetNewRole);
    }

    async getLearnerFullStats(learnerId: string): Promise<LearnerStats> {
        return this.statsRepository.getLearnerFullStats(learnerId);
    }

    async getLearnerAchievements(learnerId: string): Promise<LearnerAchievement[]> {
        return this.statsRepository.getLearnerAchievements(learnerId);
    }

    async createLearner(data: { parentId: string; displayName: string; avatarUrl: string }): Promise<Learner> {
        return this.learnerRepository.createLearner(data);
    }

    async ensureProfileExists(data: { id: string; email: string; fullName: string }): Promise<void> {
        return this.learnerRepository.ensureProfileExists(data);
    }

    async getLearnersByParentId(parentId: string): Promise<Learner[]> {
        return this.learnerRepository.getLearnersByParentId(parentId);
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseReader.getAllCourses();
    }

    async getGlobalStats() {
        return this.statsRepository.getGlobalStats();
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
        return stats.skills.map(s => ({
            category: s.name,
            initial: Math.max(10, Math.round(s.percentage * 0.75)),
            current: s.percentage
        }));
    }
}
