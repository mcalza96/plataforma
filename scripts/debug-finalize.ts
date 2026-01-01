
// Mock Next.js context
import * as headers from 'next/headers';
(headers as any).cookies = () => ({
    get: (key: string) => ({ value: 'test-learner-id' }),
    getAll: () => [],
});
(headers as any).headers = () => ({
    get: () => '127.0.0.1',
});

import { finalizeAttempt } from '../lib/actions/assessment/exam-actions';

const ATTEMPT_ID = '906e0f38-1e33-4415-afca-5e44a343b5bd';

async function debugFinalize() {
    console.log(`Debug Finalize: ${ATTEMPT_ID}`);
    try {
        // We might fail on supabase createClient if it uses cookies() internally too
        // but let's try to reach the logic
        const result = await finalizeAttempt(ATTEMPT_ID);
        console.log("Result:", result);
    } catch (error: any) {
        console.error("CRITICAL ERROR:", error);
    }
}

debugFinalize();
