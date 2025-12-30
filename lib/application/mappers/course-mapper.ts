import { Course, Lesson } from '../../domain/entities/course';
import { CourseDTO, LessonDTO } from '../../domain/dtos/course';


/**
 * Mapper to transform between Database/DTO structures and Domain Entities.
 */
export class CourseMapper {
    /**
     * Transforms a DTO/DB row into a Course Entity.
     */
    static toDomain(dto: CourseDTO, lessons: LessonDTO[] = []): Course {
        const course = new Course(
            dto.id,
            dto.title,
            dto.description,
            dto.thumbnail_url,
            dto.level_required,
            dto.category,
            dto.teacher_id,
            dto.is_published,
            dto.created_at
        );

        lessons.forEach(l => {
            course.addLesson(this.lessonToDomain(l));
        });

        return course;
    }

    /**
     * Transforms a Course Entity back into a DTO/Serializable object.
     */
    static toDTO(course: Course): CourseDTO {
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level_required: course.level_required,
            category: course.category,
            teacher_id: course.teacher_id,
            is_published: course.is_published,
            created_at: course.created_at
        };
    }

    /**
     * Helper for Lesson mapping.
     */
    static lessonToDomain(dto: LessonDTO): Lesson {
        return new Lesson(
            dto.id,
            dto.course_id,
            dto.title,
            dto.description,
            dto.thumbnail_url,
            dto.video_url,
            dto.download_url,
            dto.order,
            dto.total_steps,
            dto.parent_node_id
        );
    }

    static lessonToDTO(lesson: Lesson): LessonDTO {
        return {
            id: lesson.id,
            course_id: lesson.course_id,
            title: lesson.title,
            description: lesson.description,
            thumbnail_url: lesson.thumbnail_url,
            video_url: lesson.video_url,
            download_url: lesson.download_url,
            order: lesson.order,
            total_steps: lesson.total_steps,
            parent_node_id: lesson.parent_node_id
        };
    }
}
