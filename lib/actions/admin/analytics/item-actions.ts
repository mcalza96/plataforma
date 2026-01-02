"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";

export interface GlobalItemHealth {
    teacher_id: string;
    exam_id: string;
    exam_title: string;
    question_id: string;
    total_responses: number;
    accuracy_rate: number;
    median_time_ms: number;
    health_status: 'HEALTHY' | 'BROKEN' | 'TRIVIAL';
    slip_param?: number;
    guess_param?: number;
}

export interface IntegrityAlert {
    id: string;
    exam_id: string;
    question_id?: string;
    competency_id?: string;
    alert_type: 'CONCEPT_DRIFT' | 'HIGH_SLIP' | 'USELESS_DISTRACTOR' | 'FRAGILE_PREREQUISITE';
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    message: string;
    metadata: any;
    is_resolved: boolean;
    created_at: string;
}

export async function getGlobalItemHealth(): Promise<GlobalItemHealth[]> {
    await validateAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('vw_item_health')
        .select(`
            *,
            exams:exam_id (
                title
            )
        `)
        .order('accuracy_rate', { ascending: true });

    if (error) {
        console.error('Error fetching global item health:', error);
        throw new Error('No se pudo obtener la matriz de salud de ítems.');
    }

    return (data || []).map((item: any) => ({
        ...item,
        exam_title: item.exams?.title || 'Examen desconocido'
    })) as GlobalItemHealth[];
}

export async function getIntegrityAlerts(): Promise<IntegrityAlert[]> {
    await validateAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('integrity_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching integrity alerts:', error);
        throw new Error('No se pudieron obtener las alertas de integridad.');
    }

    return data || [];
}

export async function getGlobalItemCalibration(): Promise<GlobalItemHealth[]> {
    await validateAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_item_calibration_snapshot');

    if (error) {
        console.error('Error fetching calibration snapshot:', error);
        return getGlobalItemHealth();
    }

    return (data || []).map((item: any) => ({
        question_id: item.question_id,
        exam_id: item.exam_id,
        teacher_id: item.teacher_id,
        exam_title: item.exam_title,
        total_responses: item.total_responses,
        accuracy_rate: item.accuracy_rate,
        median_time_ms: item.median_time_ms,
        health_status: item.health_status,
        slip_param: item.slip_param,
        guess_param: item.guess_param
    }));
}
