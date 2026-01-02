'use server';

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { getUserId } from '@/lib/infrastructure/auth-utils';
import { TeacherAnalyticsResult } from '@/lib/domain/analytics-types';
import { TeacherAnalyticsService } from '@/lib/application/services/analytics/teacher-analytics-service';

/**
 * Obtiene analíticas avanzadas para el dashboard del profesor (Gestión Táctica de Aula)
 */
export async function getTeacherAnalytics(examId?: string): Promise<TeacherAnalyticsResult | null> {
    const teacherId = await getUserId();
    if (!teacherId) return null;

    const supabase = await createClient();
    const service = new TeacherAnalyticsService(supabase);

    return await service.getTeacherAnalytics(teacherId, examId);
}
