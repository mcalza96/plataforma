"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { getUserId } from "@/lib/infrastructure/auth-utils";

export interface RemediationEvent {
    id: string;
    timestamp: string;
    action: string;
    actionLabel: string;
    targetId: string;
    reason: string;
    status: 'infected' | 'locked' | 'available' | 'mastered' | string;
    evidence?: {
        type: 'MISCONCEPTION' | 'GAP' | 'MASTERY' | string;
        description: string;
        quality: 'SOLID' | 'CONFUSION' | 'NOISE';
    };
}

export interface RemediationHistory {
    attemptId: string;
    events: RemediationEvent[];
    algorithmVersion: string;
}

export async function getRemediationHistory(attemptId: string): Promise<RemediationHistory | null> {
    const teacherId = await getUserId();
    if (!teacherId) return null;

    const supabase = await createClient();

    const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .select('id, applied_mutations, results_cache')
        .eq('id', attemptId)
        .single();

    if (error || !attempt) {
        console.error("[getRemediationHistory] Error fetching attempt:", error);
        return null;
    }

    const mutations = (attempt.applied_mutations || []) as any[];
    const resultsCache = attempt.results_cache || {};
    const diagnoses = resultsCache.competencyDiagnoses || [];

    const events: RemediationEvent[] = mutations.map((m, idx) => {
        // Map action to professional label
        let actionLabel = "Acción de Sistema";
        if (m.action === 'INSERT_NODE' && m.metadata?.newStatus === 'infected') {
            actionLabel = "Protocolo de Desinfección Activado";
        } else if (m.action === 'INSERT_NODE') {
            actionLabel = "Andamiaje Inyectado";
        } else if (m.action === 'LOCK_DOWNSTREAM') {
            actionLabel = "Cuarentena Cognitiva";
        } else if (m.action === 'UNLOCK_NEXT') {
            actionLabel = "Ruta Curricular Liberada";
        }

        // Find linked diagnosis for evidence
        const diagnosis = diagnoses.find((d: any) => d.competencyId === m.target);

        let evidenceQuality: 'SOLID' | 'CONFUSION' | 'NOISE' = 'SOLID';
        if (diagnosis?.evidence?.behavior?.isRapidGuessing) {
            evidenceQuality = 'NOISE';
        } else if (diagnosis?.state === 'MISCONCEPTION' && diagnosis?.evidence?.confidence === 'HIGH') {
            evidenceQuality = 'CONFUSION'; // High confidence but wrong
        }

        return {
            id: `${attemptId}-mut-${idx}`,
            timestamp: m.timestamp,
            action: m.action,
            actionLabel,
            targetId: m.target,
            reason: m.reason,
            status: m.metadata?.newStatus || 'unknown',
            evidence: diagnosis ? {
                type: diagnosis.state,
                description: diagnosis.evidence?.reason || diagnosis.reason || "Derivado de desempeño",
                quality: evidenceQuality
            } : undefined
        };
    });

    return {
        attemptId: attempt.id,
        events,
        algorithmVersion: "TriageEngine v2.1"
    };
}
