import { IStudentRepository } from '../../domain/repositories/learner-repository';
import { IStatsRepository } from '../../domain/repositories/stats-repository';
import { AuthGuard } from '../guards/auth-guard';

export class AdminService {
    constructor(
        private learnerRepository: IStudentRepository,
        private statsRepository: IStatsRepository
    ) { }

    async updateUserRole(targetUserId: string, targetNewRole: string, currentUserId: string, currentUserRole: string): Promise<void> {
        AuthGuard.check(currentUserRole, ['admin']);
        if (currentUserId === targetUserId && targetNewRole !== 'admin') {
            throw new Error('No puedes quitarte el rol de administrador a ti mismo.');
        }
        return this.learnerRepository.updateUserRole(targetUserId, targetNewRole);
    }

    async getGlobalStats(currentUserRole: string, teacherId?: string) {
        AuthGuard.check(currentUserRole, ['admin']);
        return this.statsRepository.getGlobalStats(teacherId);
    }

    /**
     * EMPIRICAL CALIBRATION ENGINE (Phase 6)
     * Analyzes cohort performance to detect broken items and drift.
     */
    async runCalibrationCycle(examId: string, teacherId: string): Promise<boolean> {
        const { createClient } = await import('@/lib/infrastructure/supabase/supabase-server');
        const supabase = await createClient();

        // 1. Fetch Raw Data (Batch Processing)
        // 1. Fetch Raw Data (Batch Processing)
        // Trigger Rule: "Cuando un examen alcance los 10 intentos completados (N=10)"
        // In a real trigger, we'd check if (total % 10 === 0) or just > 10.
        // For reliability, we run if > 10, but maybe debounced in real life.
        const attempts = await this.statsRepository.getCalibrationData(examId);

        // Requirement: Minimum 10 attempts to have statistical significance
        if (!attempts || attempts.length < 10) {
            console.log(`Calibration skipped: Insufficient N (${attempts?.length || 0} < 10)`);
            return false;
        }

        // 2. Identify High Performers (Top 25%) - The "Experts"
        const scores = attempts.map(a => ({
            learnerId: a.learner_id,
            score: a.results_cache?.overallScore || 0
        }));
        // Sort descending
        scores.sort((a, b) => b.score - a.score);

        // Identify the score threshold for the top 25%
        const top25Index = Math.floor(scores.length * 0.25);
        // Ensure minimal top group size (at least 1 person if N=10, 25% is 2.5 -> 2 people)
        // We take the slice 0 to top25Index (exclusive if 0-indexed, so actually index is count)
        const expertCount = Math.max(1, top25Index);

        const topPerformers = new Set(scores.slice(0, expertCount).map(s => s.learnerId));

        // 3. Aggregate Item Statistics
        const itemStats: Record<string, { total: number, correct: number, expertFail: number, novicePass: number, distractorCounts: Record<string, number> }> = {};

        // Flatten all responses
        for (const attempt of attempts) {
            const isExpert = topPerformers.has(attempt.learner_id);
            const responses = attempt.results_cache?.rawResponses || []; // Assuming rawResponses exists in cache

            for (const r of responses) {
                if (!itemStats[r.questionId]) {
                    itemStats[r.questionId] = { total: 0, correct: 0, expertFail: 0, novicePass: 0, distractorCounts: {} };
                }
                const stats = itemStats[r.questionId];
                stats.total++;
                if (r.isCorrect) {
                    stats.correct++;
                    if (!isExpert) stats.novicePass++; // Simplification: non-expert = novice for this metric
                } else {
                    if (isExpert) stats.expertFail++;
                    // Track distractor selection
                    stats.distractorCounts[r.selectedOptionId] = (stats.distractorCounts[r.selectedOptionId] || 0) + 1;
                }
            }
        }

        // 4. Calculate Parameters & Detect Anomalies
        const alerts: any[] = [];
        const calibrationEntries: any[] = [];

        for (const [qId, stats] of Object.entries(itemStats)) {
            const slip = stats.expertFail / (topPerformers.size || 1); // Prob expert failed
            const difficulty = stats.correct / stats.total;

            calibrationEntries.push({
                exam_id: examId,
                question_id: qId,
                slip_param: Number(slip.toFixed(3)),
                guess_param: 0, // Placeholder
                difficulty_index: Number(difficulty.toFixed(3))
            });

            // Integrity Check: High Slip (Ambiguity)
            if (slip > 0.4) {
                alerts.push({
                    teacher_id: teacherId,
                    exam_id: examId,
                    question_id: qId,
                    alert_type: 'HIGH_SLIP',
                    severity: 'CRITICAL',
                    message: `Alerta de Ambigüedad: El ${(slip * 100).toFixed(0)}% de tus mejores estudiantes falló esta pregunta.`,
                    metadata: { slip_val: slip }
                });
            }

            // Distractor Analysis (Useless Options)
            for (const [optId, count] of Object.entries(stats.distractorCounts)) {
                const selectionRate = count / stats.total;
                if (selectionRate < 0.05) {
                    alerts.push({
                        teacher_id: teacherId,
                        exam_id: examId,
                        question_id: qId,
                        alert_type: 'USELESS_DISTRACTOR',
                        severity: 'LOW',
                        message: `Poda Sugerida: La opción ${optId} fue elegida por menos del 5% de los alumnos.`,
                        metadata: { selection_rate: selectionRate, option_id: optId }
                    });
                }
            }
        }

        // 5. Persist Results (Async Fire & Forget structure)
        if (calibrationEntries.length > 0) {
            await supabase.from('item_calibration_history').insert(calibrationEntries);
        }
        if (alerts.length > 0) {
            await supabase.from('integrity_alerts').insert(alerts);
        }

        return true;
    }
}
