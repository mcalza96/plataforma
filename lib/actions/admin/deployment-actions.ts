"use server";

import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/lib/infrastructure/auth-utils';

/**
 * Interface for Deployment Impact result
 */
export interface DeploymentImpact {
    probeId: string;
    targetId: string;
    frontierNodes: Array<{
        id: string;
        title: string;
        status: 'ready' | 'blocked' | 'target';
    }>;
    shadowDensity: number; // Percentage of known misconceptions covered
    estimatedCohorteSize: number;
}

/**
 * Fetches available cohorts for the current teacher
 */
export async function getTeacherCohorts() {
    const supabase = await createClient();
    const teacherId = await getUserId();

    const { data, error } = await supabase
        .from('cohorts')
        .select(`
            id,
            name,
            course_id,
            cohort_members (student_id)
        `)
        .eq('teacher_id', teacherId);

    if (error) throw error;
    return data || [];
}

/**
 * Calculates the pedagogical impact of deploying a probe to a cohort
 */
export async function getDeploymentImpact(probeId: string, cohortId: string): Promise<DeploymentImpact> {
    const supabase = await createClient();

    // 1. Get Probe details (competency_id)
    const { data: probe } = await supabase
        .from('diagnostic_probes')
        .select('competency_id')
        .eq('id', probeId)
        .single();

    if (!probe) throw new Error("Probe not found");

    // 2. Get Cohort Members
    const { data: members } = await supabase
        .from('cohort_members')
        .select('student_id')
        .eq('cohort_id', cohortId);

    const studentIds = members?.map(m => m.student_id) || [];

    // 3. Get Competency Hierarchy (Simplificado para el prototipo)
    // En una implementación real, buscaríamos prerequisitos en competency_edges
    const { data: compNode } = await supabase
        .from('competency_nodes')
        .select('id, title, metadata')
        .eq('id', probe.competency_id)
        .single();

    // 4. Mock simulation of Shadow Density using node metadata
    const shadowCount = compNode?.metadata?.shadowNodesCount || 0;

    return {
        probeId,
        targetId: cohortId,
        frontierNodes: [
            { id: probe.competency_id, title: compNode?.title || 'Unknown', status: 'target' }
        ],
        shadowDensity: Math.min(shadowCount * 25, 100), // Mock logic
        estimatedCohorteSize: studentIds.length
    };
}

/**
 * Deploys an instrument (Probe) to all members of a cohort or course
 */
export async function deployInstrument(probeId: string, targetId: string, type: 'cohort' | 'course') {
    const supabase = await createClient();
    const teacherId = await getUserId();

    console.log(`[Deployment] Deploying probe ${probeId} to ${type} ${targetId}`);

    // 1. Resolve student IDs
    let studentIds: string[] = [];

    if (type === 'cohort') {
        const { data: members } = await supabase
            .from('cohort_members')
            .select('student_id')
            .eq('cohort_id', targetId);
        studentIds = members?.map(m => m.student_id) || [];
    } else {
        // Enrolment logic for courses would go here
        // For now, let's assume courses have enrolled students in a mapping table
        // (This part depends on how courses/enrolments are structured in current schema)
        return { success: false, error: "Course deployment not implemented yet" };
    }

    if (studentIds.length === 0) {
        return { success: false, error: "Target group is empty" };
    }

    // 2. Create Assignments (Bulk)
    // We map DiagnosticProbes to the legacy 'exams' table for backwards compatibility
    // if DiagnosticProbes are considered a type of exam.
    // Based on previous refactors, they are linked.

    const assignments = studentIds.map(sid => ({
        exam_id: probeId, // DiagnosticProbes ID
        student_id: sid,
        assigned_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('exam_assignments')
        .upsert(assignments, { onConflict: 'exam_id, student_id' });

    if (error) throw error;

    // 3. Telemetry Event: Inicio de Ciclo
    await supabase.from('ai_usage_logs').insert({
        user_id: teacherId,
        model: 'deployment-orchestrator',
        feature_used: 'CALIBRATION_CYCLE_STARTED',
        tokens_input: assignments.length,
        cost_estimated: 0
    });

    revalidatePath('/admin/deploy');
    revalidatePath('/admin/inventory');

    return { success: true, deployedCount: studentIds.length };
}
