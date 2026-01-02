import {
    RemediationFairnessRow,
    ItemDIFRow
} from '@/lib/domain/analytics-types';

export interface FairnessAuditResults {
    groupMetrics: {
        demographic_group: string;
        total_attempts: number;
        failed_attempts: number;
        avg_score: number;
        intervention_rate: number;
    }[];
    accessMetrics: {
        access_type: string;
        avg_score: number;
        intervention_rate: number;
        fragile_knowledge_rate: number;
    }[];
    difAlerts: {
        question_id: string;
        gap: number;
        status: 'WARNING' | 'CRITICAL';
    }[];
    impactRatio: number;
    equityStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export class FairnessAuditorService {
    /**
     * Implementation of the Four-Fifths Rule (80% Rule) to detect Disparate Impact.
     * Compares intervention rates across demographic groups.
     */
    static calculateImpactRatio(groupMetrics: RemediationFairnessRow[]): number {
        const demographicRates = groupMetrics
            .filter(d => d.demographic_group !== 'generic')
            .map(d => d.intervention_rate);

        if (demographicRates.length === 0) return 1;

        const minRate = Math.min(...demographicRates);
        const maxRate = Math.max(...demographicRates);

        return maxRate > 0 ? minRate / maxRate : 1;
    }

    /**
     * Determines the overall equity status based on impact ratio and DIF alerts.
     */
    static determineEquityStatus(impactRatio: number, difAlerts: ItemDIFRow[]): 'OPTIMAL' | 'WARNING' | 'CRITICAL' {
        if (impactRatio < 0.8 || difAlerts.some(a => a.status === 'CRITICAL')) {
            return 'CRITICAL';
        }
        if (impactRatio < 0.9 || difAlerts.some(a => a.status === 'WARNING')) {
            return 'WARNING';
        }
        return 'OPTIMAL';
    }

    /**
     * Aggregates access-type metrics (mobile vs desktop) from remediation data.
     */
    static processAccessMetrics(fairnessData: RemediationFairnessRow[]) {
        const accessGroups = fairnessData.reduce((acc: any, curr) => {
            if (!acc[curr.access_type]) {
                acc[curr.access_type] = { scores: [], rates: [] };
            }
            acc[curr.access_type].scores.push(curr.avg_score);
            acc[curr.access_type].rates.push(curr.intervention_rate);
            return acc;
        }, {});

        return Object.entries(accessGroups).map(([type, stats]: [string, any]) => ({
            access_type: type,
            avg_score: stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length,
            intervention_rate: stats.rates.reduce((a: number, b: number) => a + b, 0) / stats.rates.length,
            fragile_knowledge_rate: 0.1 // Baseline assumption or derived from another view
        }));
    }
}
