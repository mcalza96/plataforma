import { ICourseWriter } from '../../repositories/course-repository';
import { Course, UpsertCourseInput } from '../../domain/course';

/**
 * Use Case: Save or Update a Course.
 */
export class SaveCourseUseCase {
    constructor(private courseWriter: ICourseWriter) { }

    async execute(data: UpsertCourseInput): Promise<Course> {
        // Business Rule: Validate minimum content if trying to publish
        if (data.is_published) {
            if (!data.title || !data.description || data.description.length < 20) {
                throw new Error('La misión debe tener un título y una descripción detallada para ser publicada.');
            }
        }

        return this.courseWriter.upsertCourse(data);
    }
}
