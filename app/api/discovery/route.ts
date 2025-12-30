import { continueInterview } from '../../../lib/application/services/discovery-service';
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';

export async function POST(req: Request) {
    // Rate Limit Check
    const identifier = "mock-user-id"; // Replace with auth logic
    const { success } = await checkRateLimit(identifier, 'chat');

    if (!success) {
        return new Response("Has alcanzado tu límite de velocidad cognitiva por hoy.", { status: 429 });
    }

    const { messages } = await req.json();
    return continueInterview(messages);
}
