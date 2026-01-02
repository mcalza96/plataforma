import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { PATHOLOGY_THRESHOLDS } from '@/lib/domain/evaluation/pathology-rules';

export class BiasAuditService {
    /**
     * Detección de Sesgo en Ítems (DIF)
     */
    static async detectItemBias(examId: string) {
        const supabase = await createClient();
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select(`
                id, current_state, results_cache, score:results_cache->>overallScore,
                learner:profiles!learner_id(demographic_group)
            `)
            .eq('exam_config_id', examId)
            .eq('status', 'COMPLETED');

        if (!attempts || attempts.length === 0) return;

        const bands = this.createAbilityBands(attempts);
        const questionIds = Object.keys(attempts[0].current_state || {});

        for (const qId of questionIds) {
            const highAbilityCohort = [...bands[0], ...bands[1]]; // Q3 + Q4
            const groupStats = this.calculateGroupStats(highAbilityCohort, qId);

            const rates = Object.entries(groupStats).map(([g, s]) => ({
                group: g,
                rate: s.total > 0 ? s.correct / s.total : 0
            }));

            if (rates.length < 2) continue;

            const maxRate = Math.max(...rates.map(r => r.rate));
            const minRate = Math.min(...rates.map(r => r.rate));

            if (maxRate - minRate > PATHOLOGY_THRESHOLDS.DIF_GAP_WARNING) {
                const disadvantaged = rates.find(r => r.rate === minRate)?.group;
                await this.createAlert(supabase, examId, qId, 'DIF_DETECTED',
                    `Posible funcionamiento diferencial (DIF). El grupo '${disadvantaged}' tiene un desempeño 20% menor.`);
            }
        }
    }

    /**
     * Auditoría de Etiquetas Cognitivas
     */
    static async auditCognitiveLabels(examId: string) {
        const supabase = await createClient();
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select(`id, results_cache, learner:profiles!learner_id(demographic_group)`)
            .eq('exam_config_id', examId);

        if (!attempts || attempts.length === 0) return;

        const labelCounts = this.aggregateLabels(attempts);
        const rates = Object.entries(labelCounts).map(([g, s]) => ({ group: g, rate: s.total > 0 ? s.impulsive / s.total : 0 }));

        if (rates.length < 2) return;

        const maxRate = Math.max(...rates.map(r => r.rate));
        const minRate = Math.min(...rates.map(r => r.rate));

        if (maxRate - minRate > PATHOLOGY_THRESHOLDS.LABEL_BIAS_THRESHOLD) {
            const impacted = rates.find(r => r.rate === maxRate)?.group;
            await this.createAlert(supabase, examId, impacted!, 'LABEL_BIAS',
                `Impacto Dispar: El grupo '${impacted}' es etiquetado como 'Impulsivo' desproporcionadamente.`);
        }
    }

    private static createAbilityBands(attempts: any[]) {
        const sorted = [...attempts].sort((a, b) => Number(b.score) - Number(a.score));
        const qSize = Math.ceil(sorted.length / 4);
        return [sorted.slice(0, qSize), sorted.slice(qSize, qSize * 2), sorted.slice(qSize * 2, qSize * 3), sorted.slice(qSize * 3)];
    }

    private static calculateGroupStats(cohort: any[], qId: string) {
        const stats: Record<string, { correct: number, total: number }> = {};
        cohort.forEach(a => {
            const group = a.learner?.demographic_group || 'unknown';
            if (!stats[group]) stats[group] = { correct: 0, total: 0 };
            stats[group].total++;
            if (a.current_state[qId]?.isCorrect) stats[group].correct++;
        });
        return stats;
    }

    private static aggregateLabels(attempts: any[]) {
        const counts: Record<string, { impulsive: number, total: number }> = {};
        attempts.forEach(a => {
            const group = a.learner?.demographic_group || 'unknown';
            if (!counts[group]) counts[group] = { impulsive: 0, total: 0 };
            counts[group].total++;
            if (a.results_cache?.behaviorProfile?.isImpulsive) counts[group].impulsive++;
        });
        return counts;
    }

    private static async createAlert(supabase: any, examId: string, id: string, type: string, msg: string) {
        const { data: exam } = await supabase.from('exams').select('creator_id').eq('id', examId).single();
        if (!exam) return;
        await supabase.from('integrity_alerts').insert({
            teacher_id: exam.creator_id, exam_id: examId, question_id: id,
            alert_type: type, severity: 'MEDIUM', message: msg
        });
    }
}
