import {
    ICourseReader,
    ICourseWriter
} from '../../domain/repositories/course-repository';
import { Course } from '../../domain/entities/course';
import { UpsertCourseInput } from '../../domain/dtos/course';
import { AuthGuard } from '../guards/auth-guard';
import { SaveCourseUseCase } from '../use-cases/save-course-use-case';
import { PublishCourseUseCase } from '../use-cases/publish-course-use-case';

/**
 * Domain service for Course operations.
 * Acts as a Facade for Application Use Cases.
 */
export class CourseService {
    private saveCourseUC: SaveCourseUseCase;
    private publishCourseUC: PublishCourseUseCase;

    constructor(
        private courseReader: ICourseReader,
        private courseWriter: ICourseWriter
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
        return this.publishCourseUC.execute({ courseId, userId, userRole });
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.courseReader.getCourseById(id);
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseReader.getAllCourses();
    }
}
