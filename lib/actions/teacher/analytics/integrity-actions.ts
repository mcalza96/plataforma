"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { getUserId } from "@/lib/infrastructure/auth-utils";

export interface TeacherIntegrityAlert {
    id: string;
    exam_id: string;
    question_id?: string;
    competency_id?: string;
    alert_type: 'CONCEPT_DRIFT' | 'HIGH_SLIP' | 'USELESS_DISTRACTOR' | 'FRAGILE_PREREQUISITE';
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    message: string;
    metadata: any;
    created_at: string;
}

/**
 * Fetches integrity alerts for the authenticated teacher.
 * Filters by teacher_id and shows only unresolved alerts.
 */
export async function getTeacherIntegrityAlerts(): Promise<TeacherIntegrityAlert[]> {
    const teacherId = await getUserId();
    if (!teacherId) return [];

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('integrity_alerts')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_resolved', false)
        .order('severity', { ascending: false }) // CRITICAL first
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching teacher integrity alerts:', error);
        return [];
    }

    return data || [];
}
