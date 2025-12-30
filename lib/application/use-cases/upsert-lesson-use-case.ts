import { ILessonRepository } from '../../domain/repositories/lesson-repository';
import { Lesson } from '../../domain/entities/course';
import { UpsertLessonInput } from '../../domain/dtos/course';


/**
 * Use Case: Create or Update a Lesson.
 */
export class UpsertLessonUseCase {
    constructor(private lessonRepository: ILessonRepository) { }

    async execute(data: UpsertLessonInput): Promise<Lesson> {
        // Business Rule: Auto-calculate order for new lessons
        if (!data.id && (!data.order || data.order === 0)) {
            const maxOrder = await this.lessonRepository.getMaxOrder(data.course_id);
            data.order = maxOrder + 1;
        }

        return this.lessonRepository.upsertLesson(data);
    }
}
