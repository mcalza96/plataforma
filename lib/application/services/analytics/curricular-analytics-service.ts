import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { PATHOLOGY_THRESHOLDS } from '@/lib/domain/evaluation/pathology-rules';

export class CurricularAnalyticsService {
    /**
     * Detección de "Deriva de Concepto"
     */
    static async detectConceptDrift(examId: string) {
        const supabase = await createClient();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const { data: recent } = await supabase.from('exam_attempts').select('results_cache').eq('exam_config_id', examId).gte('finished_at', sevenDaysAgo.toISOString());
        const { data: historic } = await supabase.from('exam_attempts').select('results_cache').eq('exam_config_id', examId).lt('finished_at', sevenDaysAgo.toISOString()).limit(100);

        if (!recent || recent.length < 5 || !historic || historic.length < 10) return;

        const recentRates = this.getConceptRates(recent);
        const baselineRates = this.getConceptRates(historic);

        for (const [cid, rec] of Object.entries(recentRates)) {
            const base = baselineRates[cid];
            if (base && base.total > 5) {
                const diff = (base.passed / base.total) - (rec.passed / rec.total);
                if (diff > PATHOLOGY_THRESHOLDS.CONCEPT_DRIFT_ALARM) {
                    await this.createAlert(supabase, examId, cid, 'CONCEPT_DRIFT', `Deriva de Concepto en '${cid}': Caída del ${Math.round(diff * 100)}%.`);
                }
            }
        }
    }

    /**
     * Topology Validator
     */
    static async validateGraphTopology(examId: string) {
        const supabase = await createClient();
        const { data: edges } = await supabase.from('competency_edges').select('source_id, target_id').eq('relation_type', 'prerequisite');
        if (!edges) return;
        // Placeholder for complex causality check
    }

    private static getConceptRates(attempts: any[]) {
        const rates: Record<string, { total: number, passed: number }> = {};
        attempts.forEach(a => {
            const diagnoses = a.results_cache?.competencyDiagnoses || [];
            diagnoses.forEach((d: any) => {
                const cid = d.competencyId;
                if (!rates[cid]) rates[cid] = { total: 0, passed: 0 };
                rates[cid].total++;
                if (d.state === 'MASTERED') rates[cid].passed++;
            });
        });
        return rates;
    }

    private static async createAlert(supabase: any, examId: string, id: string, type: string, msg: string) {
        const { data: exam } = await supabase.from('exams').select('creator_id').eq('id', examId).single();
        if (!exam) return;
        await supabase.from('integrity_alerts').insert({
            teacher_id: exam.creator_id, exam_id: examId, alert_type: type, severity: 'LOW', message: msg
        });
    }
}
