import { SupabaseClient } from '@supabase/supabase-js';
import { IRTMetrics } from '@/lib/domain/evaluation/irt-metrics';
import { PATHOLOGY_THRESHOLDS } from '@/lib/domain/evaluation/pathology-rules';

export interface CalibrationResult {
    examId: string;
    questionId: string;
    metrics: {
        slip: number;
        guess: number;
        difficulty: number;
        discrimination: number;
    }
}

export class ItemCalibrationService {
    /**
     * Entry point for a batch calibration cycle.
     * Analyzes cohort performance to detect broken items and drift.
     */
    static async runCalibrationCycle(supabase: SupabaseClient, examId: string): Promise<boolean> {
        // 1. Fetch Raw Data (N >= 10)
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select(`id, learner_id, current_state, results_cache`)
            .eq('exam_config_id', examId)
            .eq('status', 'COMPLETED');

        if (!attempts || attempts.length < 10) {
            console.log(`[ItemCalibrationService] Calibration skipped: Insufficient N (${attempts?.length || 0} < 10)`);
            return false;
        }

        // 2. Identify High Performers (Top 25%) - The "Experts"
        const scores = attempts.map(a => ({
            id: a.id,
            learnerId: a.learner_id,
            score: (a.results_cache as any)?.overallScore || 0
        }));
        scores.sort((a, b) => b.score - a.score);

        const expertCount = Math.max(1, Math.floor(scores.length * 0.25));
        const masters = new Set(scores.slice(0, expertCount).map(s => s.id));

        const noviceStart = Math.ceil(scores.length * 0.75);
        const novices = new Set(scores.slice(noviceStart).map(s => s.id));

        // 3. Calibrate Items & Detect Pathologies
        await this.calibrateItems(supabase, examId, attempts, masters, novices);
        await this.detectDistractorPathologies(supabase, attempts, examId);

        return true;
    }

    /**
     * Calculates Item Parameters using IRT metrics and domain thresholds.
     */
    static async calibrateItems(
        supabase: SupabaseClient,
        examId: string,
        attempts: any[],
        masters: Set<string>,
        novices: Set<string>,
        cohortId?: string
    ): Promise<CalibrationResult[]> {
        const results: CalibrationResult[] = [];
        const questionIds = this.extractQuestionIds(attempts);

        for (const qId of questionIds) {
            const validAttempts = attempts.filter(a => {
                const response = a.current_state?.[qId];
                // In a real scenario, we'd check telemetry from forensic logs here
                // For now, we use the snapshot if available
                return !!response;
            });

            if (validAttempts.length === 0) continue;

            let correctMasterCount = 0;
            let correctNoviceCount = 0;
            let totalCorrect = 0;
            const validMasters = validAttempts.filter(a => masters.has(a.id)).length;
            const validNovices = validAttempts.filter(a => novices.has(a.id)).length;

            validAttempts.forEach(a => {
                const answer = a.results_cache?.rawResponses?.find((r: any) => r.questionId === qId)
                    || { isCorrect: a.current_state[qId]?.isCorrect };

                if (answer?.isCorrect) {
                    totalCorrect++;
                    if (masters.has(a.id)) correctMasterCount++;
                    if (novices.has(a.id)) correctNoviceCount++;
                }
            });

            const p = totalCorrect / validAttempts.length;
            const slip = IRTMetrics.calculateSlip(correctMasterCount, validMasters);
            const guess = IRTMetrics.calculateGuess(correctNoviceCount, validNovices);
            const p_upper = validMasters > 0 ? correctMasterCount / validMasters : 0;
            const p_lower = validNovices > 0 ? correctNoviceCount / validNovices : 0;
            const discrimination = IRTMetrics.calculateDiscrimination(p_upper, p_lower);

            // Persist History
            await supabase.from('item_calibration_history').insert({
                exam_id: examId,
                question_id: qId,
                cohort_id: cohortId,
                slip_param: Number(slip.toFixed(3)),
                guess_param: Number(guess.toFixed(3)),
                difficulty_index: Number(p.toFixed(3)),
                discrimination_index: Number(discrimination.toFixed(3))
            });

            // Alerts
            if (slip > PATHOLOGY_THRESHOLDS.HIGH_SLIP_CRITICAL) {
                await this.createAlert(supabase, examId, qId, 'HIGH_SLIP',
                    `Alerta de Ambigüedad: El ${Math.round(slip * 100)}% de los mejores estudiantes falló esta pregunta.`);
            }

            results.push({
                examId,
                questionId: qId,
                metrics: { slip, guess, difficulty: p, discrimination }
            });
        }

        return results;
    }

    static async detectDistractorPathologies(supabase: SupabaseClient, attempts: any[], examId: string) {
        const { optionCounts, totalCounts } = this.aggregateSelections(attempts);

        for (const [qId, counts] of Object.entries(optionCounts)) {
            const total = totalCounts[qId];
            for (const [optId, count] of Object.entries(counts)) {
                const rate = count / total;
                if (rate < PATHOLOGY_THRESHOLDS.USELESS_DISTRACTOR_LIMIT) {
                    await this.createAlert(supabase, examId, qId, 'USELESS_DISTRACTOR',
                        `Poda Sugerida: La opción '${optId}' es ruido estadístico (<${(rate * 100).toFixed(1)}% selección).`);
                }
            }
        }
    }

    private static extractQuestionIds(attempts: any[]): Set<string> {
        const questionIds = new Set<string>();
        attempts.forEach(a => {
            if (a.current_state) Object.keys(a.current_state).forEach(q => questionIds.add(q));
        });
        return questionIds;
    }

    private static aggregateSelections(attempts: any[]) {
        const optionCounts: Record<string, Record<string, number>> = {};
        const totalCounts: Record<string, number> = {};

        attempts.forEach(a => {
            if (a.current_state) {
                for (const [qId, val] of Object.entries(a.current_state)) {
                    // @ts-ignore
                    const optId = val?.selectedOptionId || val;
                    if (optId) {
                        if (!optionCounts[qId]) optionCounts[qId] = {};
                        optionCounts[qId][optId] = (optionCounts[qId][optId] || 0) + 1;
                        totalCounts[qId] = (totalCounts[qId] || 0) + 1;
                    }
                }
            }
        });
        return { optionCounts, totalCounts };
    }

    private static async createAlert(supabase: any, examId: string, questionId: string, type: string, msg: string) {
        const { data: exam } = await supabase.from('exams').select('creator_id').eq('id', examId).single();
        if (!exam) return;

        await supabase.from('integrity_alerts').insert({
            teacher_id: exam.creator_id,
            exam_id: examId,
            question_id: questionId,
            alert_type: type,
            severity: type === 'HIGH_SLIP' ? 'CRITICAL' : 'LOW',
            message: msg
        });
    }
}
