'use server';

import {
    getLessonRepository,
    getCourseReader,
    getCourseWriter,
    getCompetencyRepository
} from '@/lib/infrastructure/di';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';

/**
 * Persists the discovered pedagogical context into the database.
 * Updates the course/lesson metadata and upserts competency/misconception nodes.
 */
export async function saveDiscoveryContext(lessonId: string, context: PartialKnowledgeMap) {
    const lessonRepo = getLessonRepository();
    const courseReader = getCourseReader();
    const courseWriter = getCourseWriter();
    const competencyRepo = getCompetencyRepository();

    try {
        // 1. Get Course ID from Lesson
        const lesson = await lessonRepo.getLessonById(lessonId);
        if (!lesson) {
            console.error('[saveDiscoveryContext] Lesson not found:', lessonId);
            return { success: false, error: 'Lesson not found' };
        }

        const courseId = lesson.course_id;

        // 2. Update Course metadata if identified
        if (context.subject || context.targetAudience) {
            const courseDTO = await courseReader.getCourseById(courseId);
            if (courseDTO) {
                if (context.subject) courseDTO.category = context.subject;
                // Add target audience to metadata or description if needed
                await courseWriter.upsertCourse(courseDTO);
            }
        }

        // 3. Upsert Key Concepts (Competencies)
        if (context.keyConcepts && context.keyConcepts.length > 0) {
            for (const concept of context.keyConcepts) {
                await competencyRepo.upsertNode({
                    title: concept,
                    type: 'competency',
                    metadata: { courseId }
                });
            }
        }

        // 4. Upsert Misconceptions
        if (context.identifiedMisconceptions && context.identifiedMisconceptions.length > 0) {
            for (const m of context.identifiedMisconceptions) {
                await competencyRepo.upsertNode({
                    title: m.error,
                    type: 'misconception',
                    metadata: {
                        courseId,
                        refutationStrategy: m.refutation
                    }
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('[saveDiscoveryContext] Critical error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
