"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { RemediationFairnessRow, ItemDIFRow } from "@/lib/domain/analytics-types";
import { FairnessAuditorService } from "@/lib/application/services/analytics/fairness-auditor-service";

export interface FairnessGroupMetric {
    demographic_group: string;
    total_attempts: number;
    failed_attempts: number;
    avg_score: number;
    intervention_rate: number;
}

export interface AccessMetric {
    access_type: string;
    avg_score: number;
    intervention_rate: number;
    fragile_knowledge_rate: number;
}

export interface DIFAlert {
    question_id: string;
    gap: number;
    status: 'WARNING' | 'CRITICAL';
}

export interface FairnessAuditData {
    groupMetrics: FairnessGroupMetric[];
    accessMetrics: AccessMetric[];
    difAlerts: DIFAlert[];
    impactRatio: number;
    equityStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export async function getFairnessAuditData(): Promise<FairnessAuditData> {
    await validateAdmin();
    const supabase = await createClient();

    const { data: fairnessData, error: fairnessError } = await supabase
        .from('vw_remediation_fairness')
        .select('*');

    if (fairnessError) throw new Error(`Error en Auditoría de Equidad: ${fairnessError.message}`);

    const { data: rawDifAlerts } = await supabase
        .from('vw_item_dif')
        .select('question_id, gap, status, dimension');

    const difAlerts = (rawDifAlerts as ItemDIFRow[] || []).map(alert => ({
        question_id: alert.question_id,
        gap: alert.gap,
        status: alert.status as 'WARNING' | 'CRITICAL'
    }));

    const accessMetrics = FairnessAuditorService.processAccessMetrics(fairnessData as RemediationFairnessRow[] || []);
    const impactRatio = FairnessAuditorService.calculateImpactRatio(fairnessData as RemediationFairnessRow[] || []);
    const equityStatus = FairnessAuditorService.determineEquityStatus(impactRatio, rawDifAlerts as ItemDIFRow[] || []);

    return {
        groupMetrics: (fairnessData || []) as FairnessGroupMetric[],
        accessMetrics,
        difAlerts,
        impactRatio,
        equityStatus
    };
}
