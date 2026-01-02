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

    // Fetch health data and exams in parallel to avoid relationship join issues in views
    const [healthRes, examsRes] = await Promise.all([
        supabase.from('vw_item_health').select('*'),
        supabase.from('exams').select('id, title')
    ]);

    if (healthRes.error) {
        console.error('Error fetching global item health data:', healthRes.error);
        throw new Error('No se pudo obtener la matriz de salud de ítems.');
    }

    const examMap = new Map((examsRes.data || []).map(e => [e.id, e.title]));

    return (healthRes.data || []).map((item: any) => ({
        ...item,
        exam_title: examMap.get(item.exam_id) || 'Examen desconocido'
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

    // 1. Try to fetch from RPC (Fastest if it exists)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_item_calibration_snapshot');

    if (!rpcError && rpcData) {
        return (rpcData as any[]).map(item => ({
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

    // 2. Fallback: Manual Merge in JS (Robust)
    console.warn('Falling back to manual Item Calibration merge due to RPC error:', rpcError?.message);

    const [healthData, calibrationRes] = await Promise.all([
        getGlobalItemHealth(),
        supabase.from('item_calibration_history')
            .select('question_id, slip_param, guess_param, calibration_date')
            .order('calibration_date', { ascending: false })
    ]);

    // Use a Map to keep only the latest calibration for each question
    const latestCalibrationMap = new Map();
    if (calibrationRes.data) {
        for (const cal of calibrationRes.data) {
            if (!latestCalibrationMap.has(cal.question_id)) {
                latestCalibrationMap.set(cal.question_id, cal);
            }
        }
    }

    return healthData.map(item => {
        const cal = latestCalibrationMap.get(item.question_id);
        return {
            ...item,
            slip_param: cal?.slip_param,
            guess_param: cal?.guess_param
        };
    });
}
