import { ICourseReader, ICourseWriter } from '../../repositories/course-repository';
import { CourseMapper } from '../mappers/course-mapper';

export interface PublishCourseInput {
    courseId: string;
    userId: string;
    userRole: string;
}

/**
 * Use Case: Publish a Course.
 * Orchestrates domain logic and persistence.
 */
export class PublishCourseUseCase {
    constructor(
        private courseReader: ICourseReader,
        private courseWriter: ICourseWriter
    ) { }

    async execute(input: PublishCourseInput): Promise<void> {
        const { courseId, userId, userRole } = input;

        // 1. Recover Course
        const courseDTO = await this.courseReader.getCourseById(courseId);
        if (!courseDTO) {
            throw new Error('Curso no encontrado');
        }

        const course = CourseMapper.toDomain(courseDTO);

        // 2. Verify Permissions (Owner or Admin)
        const isOwner = course.teacher_id === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            throw new Error('No tienes permisos para publicar este curso.');
        }

        // 3. Execute Domain Logic
        course.publish();

        // 4. Persistence
        await this.courseWriter.upsertCourse(CourseMapper.toDTO(course));
    }
}
