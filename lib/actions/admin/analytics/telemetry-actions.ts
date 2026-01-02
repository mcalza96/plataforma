"use server";

import { createClient } from "@/lib/infrastructure/supabase/supabase-server";
import { validateAdmin } from "@/lib/infrastructure/auth-utils";
import { TelemetryAnalyzerService } from "@/lib/application/services/analytics/telemetry-analyzer-service";

export interface TelemetryStats {
    aiEfficiency: {
        totalCost: number;
        totalTokens: number;
        avgCostPerExam: number;
        modelDistribution: { model: string; tokens: number; cost: number }[];
    };
    timeCalibration: {
        avgRealDurationSeconds: number;
        avgExpectedDurationSeconds: number;
        deviationIndex: number;
        status: 'OVERLOADED' | 'TRIVIAL' | 'CALIBRATED';
    };
    usageTrend: { date: string; count: number }[];
}

export interface LatencyStats {
    deviceType: string;
    avgRTE: number;
    impulsivityFlagRate: number;
    sampleSize: number;
}

export async function getGlobalTelemetryStats(): Promise<TelemetryStats> {
    await validateAdmin();
    const supabase = await createClient();

    const { data: usageLogs } = await supabase
        .from('ai_usage_logs')
        .select('model, tokens_input, tokens_output, cost_estimated');

    const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('started_at, finished_at, config_snapshot')
        .eq('status', 'COMPLETED');

    const totalAttempts = attempts?.length || 0;

    const aiEfficiency = TelemetryAnalyzerService.analyzeAIEfficiency(usageLogs || [], totalAttempts);
    const timeCalibration = TelemetryAnalyzerService.analyzeTimeCalibration(attempts || []);
    const usageTrend = TelemetryAnalyzerService.generateUsageTrend(attempts || []);

    return {
        aiEfficiency,
        timeCalibration,
        usageTrend
    };
}

export async function getLatencyNormalizationStats(): Promise<LatencyStats[]> {
    await validateAdmin();
    return [
        { deviceType: 'mobile', avgRTE: 0.85, impulsivityFlagRate: 0.12, sampleSize: 450 },
        { deviceType: 'desktop', avgRTE: 0.92, impulsivityFlagRate: 0.04, sampleSize: 1200 }
    ];
}
