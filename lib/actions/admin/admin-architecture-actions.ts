"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { revalidatePath } from "next/cache";

export interface DistractorStats {
    id: string;
    content: string;
    is_correct: boolean;
    selection_count: number;
    selection_rate: number;
    master_selection_count: number; // Selected by Top 30%
    is_useless: boolean;
    is_critical: boolean; // Selected by masters
    diagnoses_misconception_id?: string;
}

export interface ItemArchitectureDetail {
    probe_id: string;
    stem: string;
    competency_id: string;
    distractors: DistractorStats[];
    total_responses: number;
    accuracy_rate: number;
    drift_index: number; // Deviation from baseline
}

export async function getItemArchitectureDetail(probeId: string): Promise<ItemArchitectureDetail> {
    await validateAdmin();
    const supabase = await createClient();

    // 1. Fetch Probe and Options
    const { data: probe, error: probeError } = await supabase
        .from('diagnostic_probes')
        .select(`
            id,
            stem,
            competency_id,
            probe_options (*)
        `)
        .eq('id', probeId)
        .single();

    if (probeError || !probe) {
        throw new Error("No se pudo encontrar el reactivo especificado.");
    }

    // 2. Fetch Attempts that interacted with this probe
    // We need to look into current_state JSONB
    const { data: attempts, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('id, current_state, results_cache')
        .filter(`current_state`, 'has_key', probeId)
        .eq('status', 'COMPLETED');

    if (attemptsError || !attempts) {
        throw new Error("Error al recuperar la telemetría de respuestas.");
    }

    const totalResponses = attempts.length;

    // 3. Identify Masters (Top 30%)
    const sortedByScore = [...attempts].sort((a, b) =>
        (b.results_cache?.overallScore || 0) - (a.results_cache?.overallScore || 0)
    );
    const mastersCount = Math.floor(totalResponses * 0.3);
    const mastersIds = new Set(sortedByScore.slice(0, mastersCount).map(a => a.id));

    // 4. Aggregate Options Usage
    const optionMap: Record<string, { total: number, masters: number }> = {};
    let totalCorrect = 0;

    attempts.forEach(a => {
        const response = a.current_state[probeId];
        const selectedId = response?.selectedOptionId || response;
        const isMaster = mastersIds.has(a.id);

        if (selectedId) {
            if (!optionMap[selectedId]) optionMap[selectedId] = { total: 0, masters: 0 };
            optionMap[selectedId].total++;
            if (isMaster) optionMap[selectedId].masters++;
        }

        if (response?.isCorrect) totalCorrect++;
    });

    const distractors: DistractorStats[] = (probe.probe_options || []).map((opt: any) => {
        const stats = optionMap[opt.id] || { total: 0, masters: 0 };
        const rate = totalResponses > 0 ? stats.total / totalResponses : 0;

        return {
            id: opt.id,
            content: opt.content,
            is_correct: opt.is_correct,
            selection_count: stats.total,
            selection_rate: rate,
            master_selection_count: stats.masters,
            is_useless: !opt.is_correct && rate < 0.05 && totalResponses > 10,
            is_critical: !opt.is_correct && stats.masters > 0 && mastersCount > 0,
            diagnoses_misconception_id: opt.diagnoses_misconception_id
        };
    });

    return {
        probe_id: probe.id,
        stem: probe.stem,
        competency_id: probe.competency_id,
        distractors,
        total_responses: totalResponses,
        accuracy_rate: totalResponses > 0 ? (totalCorrect / totalResponses) * 100 : 0,
        drift_index: 0 // Placeholder for drift
    };
}

export async function pruneDistractor(optionId: string) {
    await validateAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('probe_options')
        .delete()
        .eq('id', optionId);

    if (error) throw new Error("No se pudo eliminar el distractor.");

    revalidatePath('/admin/audit/items');
    return { success: true };
}

export async function linkDistractorToMisconception(optionId: string, misconceptionId: string) {
    await validateAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('probe_options')
        .update({ diagnoses_misconception_id: misconceptionId })
        .eq('id', optionId);

    if (error) throw new Error("No se pudo vincular el distractor al Nodo Sombra.");

    revalidatePath('/admin/audit/items');
    return { success: true };
}
