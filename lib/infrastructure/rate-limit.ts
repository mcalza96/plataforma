import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 1 hour
export const diagnosticRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/diagnostic",
});

// Create a new ratelimiter, that allows 50 requests per 1 hour
export const chatRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/chat",
});

export async function checkRateLimit(identifier: string, type: 'diagnostic' | 'chat') {
    const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!isRedisConfigured) {
        console.warn(`[RateLimit] Skipping limit check for ${type} (Redis not configured)`);
        return { success: true, limit: 0, reset: 0, remaining: 0 };
    }

    try {
        const limiter = type === 'diagnostic' ? diagnosticRateLimit : chatRateLimit;
        const { success, limit, reset, remaining } = await limiter.limit(identifier);
        return { success, limit, reset, remaining };
    } catch (error) {
        console.error(`[RateLimit] Error during limit check:`, error);
        // Fallback: Si el limitador falla (ej: URL inválida), permitimos el paso en desarrollo
        return { success: true, limit: 0, reset: 0, remaining: 0 };
    }
}
