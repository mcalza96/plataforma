'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { cookies } from 'next/headers';
import { KnowledgeGraph } from '@/lib/domain/analytics-types';
import { KnowledgeGraphService } from '@/lib/application/services/analytics/knowledge-graph-service';

/**
 * getStudentKnowledgeGraph
 * Fetches the topological map for the student, applying Fog of War and Infection logic.
 */
export async function getStudentKnowledgeGraph(): Promise<KnowledgeGraph | null> {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('learner_id')?.value;
    if (!studentId) return null;

    const supabase = await createClient();
    const service = new KnowledgeGraphService(supabase);

    return await service.getStudentKnowledgeMap(studentId);
}
