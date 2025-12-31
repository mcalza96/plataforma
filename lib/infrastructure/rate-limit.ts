import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy instance helpers
let redisInstance: Redis | null = null;
function getRedis() {
    if (!redisInstance) {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            return null;
        }
        redisInstance = Redis.fromEnv();
    }
    return redisInstance;
}

let diagnosticLimitInstance: Ratelimit | null = null;
export function getDiagnosticRateLimit() {
    const redis = getRedis();
    if (!redis) return null;
    if (!diagnosticLimitInstance) {
        diagnosticLimitInstance = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, "1 h"),
            analytics: true,
            prefix: "@upstash/ratelimit/diagnostic",
        });
    }
    return diagnosticLimitInstance;
}

let chatLimitInstance: Ratelimit | null = null;
export function getChatRateLimit() {
    const redis = getRedis();
    if (!redis) return null;
    if (!chatLimitInstance) {
        chatLimitInstance = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(50, "1 h"),
            analytics: true,
            prefix: "@upstash/ratelimit/chat",
        });
    }
    return chatLimitInstance;
}

let telemetryLimitInstance: Ratelimit | null = null;
export function getTelemetryRateLimit() {
    const redis = getRedis();
    if (!redis) return null;
    if (!telemetryLimitInstance) {
        telemetryLimitInstance = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(60, "1 m"),
            analytics: true,
            prefix: "@upstash/ratelimit/telemetry",
        });
    }
    return telemetryLimitInstance;
}

let finalizationLimitInstance: Ratelimit | null = null;
export function getFinalizationRateLimit() {
    const redis = getRedis();
    if (!redis) return null;
    if (!finalizationLimitInstance) {
        finalizationLimitInstance = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(1, "10 s"),
            analytics: true,
            prefix: "@upstash/ratelimit/finalization",
        });
    }
    return finalizationLimitInstance;
}

export async function checkRateLimit(identifier: string, type: 'diagnostic' | 'chat' | 'telemetry' | 'finalization') {
    try {
        let limiter;
        switch (type) {
            case 'diagnostic': limiter = getDiagnosticRateLimit(); break;
            case 'chat': limiter = getChatRateLimit(); break;
            case 'telemetry': limiter = getTelemetryRateLimit(); break;
            case 'finalization': limiter = getFinalizationRateLimit(); break;
        }

        if (!limiter) {
            return { success: true, limit: 0, reset: 0, remaining: 0 };
        }

        const { success, limit, reset, remaining } = await limiter.limit(identifier);
        return { success, limit, reset, remaining };
    } catch (error) {
        console.error(`[RateLimit] Error during limit check:`, error);
        // Fallback: Si el limitador falla (ej: URL inválida), permitimos el paso en desarrollo
        return { success: true, limit: 0, reset: 0, remaining: 0 };
    }
}
