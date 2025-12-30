'use server';

import { createClient } from './infrastructure/supabase/supabase-server';
import { PartialKnowledgeMap } from './domain/discovery';

/**
 * Persists the discovered pedagogical context into the database.
 * Updates the course/lesson metadata and upserts competency/misconception nodes.
 */
export async function saveDiscoveryContext(lessonId: string, context: PartialKnowledgeMap) {
    const supabase = await createClient();

    try {
        // 1. Get Course ID from Lesson
        const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .select('course_id')
            .eq('id', lessonId)
            .single();

        if (lessonError || !lesson) {
            console.error('[saveDiscoveryContext] Error fetching lesson:', lessonError);
            return { success: false, error: 'Lesson not found' };
        }

        const courseId = lesson.course_id;

        // 2. Update Course metadata if identified
        if (context.subject || context.targetAudience) {
            const updates: any = {};
            if (context.subject) updates.category = context.subject; // Mapping subject to category
            // We could also update title if needed, but let's stick to category/description for now to avoid overwriting the main title unless explicit

            await supabase
                .from('courses')
                .update(updates)
                .eq('id', courseId);
        }

        // 3. Upsert Key Concepts (Competencies)
        if (context.keyConcepts && context.keyConcepts.length > 0) {
            for (const concept of context.keyConcepts) {
                // Basic Upsert by title
                const { data: existing } = await supabase
                    .from('competency_nodes')
                    .select('id')
                    .eq('title', concept)
                    .eq('node_type', 'competency')
                    .limit(1);

                if (!existing || existing.length === 0) {
                    await supabase
                        .from('competency_nodes')
                        .insert({
                            title: concept,
                            node_type: 'competency',
                            metadata: { courseId } // Link to course in metadata
                        });
                }
            }
        }

        // 4. Upsert Misconceptions
        if (context.identifiedMisconceptions && context.identifiedMisconceptions.length > 0) {
            for (const m of context.identifiedMisconceptions) {
                const { data: existing } = await supabase
                    .from('competency_nodes')
                    .select('id')
                    .eq('title', m.error)
                    .eq('node_type', 'misconception')
                    .limit(1);

                if (!existing || existing.length === 0) {
                    await supabase
                        .from('competency_nodes')
                        .insert({
                            title: m.error,
                            node_type: 'misconception',
                            metadata: {
                                courseId,
                                refutationStrategy: m.refutation
                            }
                        });
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('[saveDiscoveryContext] Critical error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
