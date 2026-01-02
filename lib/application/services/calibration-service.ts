import { createClient } from '@/lib/infrastructure/supabase/supabase-server';
import { ItemCalibrationService, CalibrationResult } from './analytics/item-calibration-service';
import { BiasAuditService } from './analytics/bias-audit-service';
import { CurricularAnalyticsService } from './analytics/curricular-analytics-service';

/**
 * CalibrationService (Facade)
 * Coordinates specialized analytics services to maintain backward compatibility.
 * @deprecated Use specialized services in lib/application/services/analytics/ directly.
 */
export class CalibrationService {

    async calculateItemParameters(examId: string, cohortId?: string): Promise<CalibrationResult[]> {
        const supabase = await createClient();
        const { data: attempts } = await supabase
            .from('exam_attempts')
            .select(`id, learner_id, current_state, results_cache, score:results_cache->>overallScore`)
            .eq('exam_config_id', examId)
            .eq('status', 'COMPLETED');

        if (!attempts || attempts.length === 0) return [];

        const sorted = [...attempts].sort((a, b) => Number(b.score) - Number(a.score));
        const masters = new Set(sorted.slice(0, Math.floor(attempts.length * 0.3)).map(a => a.id));
        const novices = new Set(sorted.slice(Math.ceil(attempts.length * 0.7)).map(a => a.id));

        const results = await ItemCalibrationService.calibrateItems(supabase, examId, attempts, masters, novices, cohortId);
        await ItemCalibrationService.detectDistractorPathologies(supabase, attempts, examId);

        return results;
    }

    async detectConceptDrift(examId: string) {
        return CurricularAnalyticsService.detectConceptDrift(examId);
    }

    async validateGraphTopology(examId: string) {
        return CurricularAnalyticsService.validateGraphTopology(examId);
    }

    async detectItemBias(examId: string) {
        return BiasAuditService.detectItemBias(examId);
    }

    async auditCognitiveLabels(examId: string) {
        return BiasAuditService.auditCognitiveLabels(examId);
    }
}
