'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { validateAdmin } from '@/lib/infrastructure/auth-utils';

/**
 * Persists the discovered pedagogical context into the database.
 * Updates the course/lesson metadata and upserts competency/misconception nodes.
 */
export async function saveDiscoveryContext(lessonId: string, context: PartialKnowledgeMap) {
    await validateAdmin();
    const supabase = await createClient();

    try {
        // 1. Get Course ID from Lesson
        const { data: lesson } = await supabase
            .from('lessons')
            .select('course_id')
            .eq('id', lessonId)
            .single();

        if (!lesson) {
            console.error('[saveDiscoveryContext] Lesson not found:', lessonId);
            return { success: false, error: 'Lesson not found' };
        }

        const courseId = lesson.course_id;

        // 2. Update Course metadata if identified
        if (context.subject || context.targetAudience) {
            const updates: any = {};
            if (context.subject) updates.category = context.subject;
            // if (context.targetAudience) updates.metadata = { ...metadata, targetAudience: context.targetAudience };

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('courses')
                    .update(updates)
                    .eq('id', courseId);
            }
        }

        // 3. Upsert Key Concepts (Competencies)
        if (context.keyConcepts && context.keyConcepts.length > 0) {
            for (const concept of context.keyConcepts) {
                const title = typeof concept === 'string' ? concept : concept.name;
                await supabase.from('competencies').upsert({
                    course_id: courseId,
                    title,
                    type: 'competency',
                    metadata: { courseId } // Redundant but keeping consistent
                }, { onConflict: 'course_id, title' as any }); // Hypothetical constraint
            }
        }

        // 4. Upsert Misconceptions
        if (context.identifiedMisconceptions && context.identifiedMisconceptions.length > 0) {
            for (const m of context.identifiedMisconceptions) {
                await supabase.from('competencies').upsert({
                    course_id: courseId,
                    title: m.error,
                    type: 'misconception',
                    metadata: {
                        courseId,
                        refutationStrategy: m.refutation
                    }
                }, { onConflict: 'course_id, title' as any });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('[saveDiscoveryContext] Critical error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
