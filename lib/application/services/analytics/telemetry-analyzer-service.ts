export interface TelemetryMetrics {
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

export class TelemetryAnalyzerService {
    /**
     * Aggregates AI model usage from raw logs.
     */
    static analyzeAIEfficiency(usageLogs: any[], totalAttempts: number) {
        const modelMap: Record<string, { tokens: number; cost: number }> = {};
        let totalCost = 0;
        let totalTokens = 0;

        usageLogs?.forEach(log => {
            const tokens = (log.tokens_input || 0) + (log.tokens_output || 0);
            const cost = Number(log.cost_estimated) || 0;

            if (!modelMap[log.model]) {
                modelMap[log.model] = { tokens: 0, cost: 0 };
            }
            modelMap[log.model].tokens += tokens;
            modelMap[log.model].cost += cost;
            totalCost += cost;
            totalTokens += tokens;
        });

        const modelDistribution = Object.entries(modelMap).map(([model, stats]) => ({
            model,
            ...stats
        }));

        return {
            totalCost,
            totalTokens,
            avgCostPerExam: totalAttempts > 0 ? totalCost / totalAttempts : 0,
            modelDistribution
        };
    }

    /**
     * Calculates time calibration and deviation index.
     */
    static analyzeTimeCalibration(attempts: any[]) {
        let totalRealDuration = 0;
        let totalExpectedDuration = 0;
        let completedCount = 0;

        attempts?.forEach(attempt => {
            const start = new Date(attempt.started_at);
            const end = new Date(attempt.finished_at);
            const duration = (end.getTime() - start.getTime()) / 1000;

            const expected = (attempt.config_snapshot as any)?.expected_time_seconds || 0;

            if (duration > 0 && expected > 0) {
                totalRealDuration += duration;
                totalExpectedDuration += expected;
                completedCount++;
            }
        });

        const avgReal = completedCount > 0 ? totalRealDuration / completedCount : 0;
        const avgExpected = completedCount > 0 ? totalExpectedDuration / completedCount : 0;
        const deviationIndex = avgExpected > 0 ? avgReal / avgExpected : 1;

        let status: 'OVERLOADED' | 'TRIVIAL' | 'CALIBRATED' = 'CALIBRATED';
        if (deviationIndex > 1.3) status = 'OVERLOADED';
        else if (deviationIndex < 0.7) status = 'TRIVIAL';

        return {
            avgRealDurationSeconds: avgReal,
            avgExpectedDurationSeconds: avgExpected,
            deviationIndex,
            status
        };
    }

    /**
     * Generates a 30-day activity trend.
     */
    static generateUsageTrend(attempts: any[], days: number = 30) {
        const trendMap: Record<string, number> = {};
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        attempts?.forEach(attempt => {
            const start = new Date(attempt.started_at);
            if (start >= startDate) {
                const dateStr = start.toISOString().split('T')[0];
                trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
            }
        });

        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            trend.push({
                date: dStr,
                count: trendMap[dStr] || 0
            });
        }
        return trend;
    }
}
