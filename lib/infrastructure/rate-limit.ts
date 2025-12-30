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
    const limiter = type === 'diagnostic' ? diagnosticRateLimit : chatRateLimit;
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    return { success, limit, reset, remaining };
}
