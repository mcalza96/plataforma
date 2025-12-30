import { createServiceRoleClient } from '../infrastructure/supabase/supabase-server';

interface UsageParams {
    userId: string;
    model: string;
    tokensInput: number;
    tokensOutput: number;
    featureUsed: 'diagnostic' | 'chat';
}

// Cost per 1k tokens (Mock rates)
const RATES: Record<string, { input: number; output: number }> = {
    'gemini-1.5-pro': { input: 0.00125, output: 0.00375 },
    'gemini-1.5-flash': { input: 0.0001, output: 0.0003 },
    'gpt-4o': { input: 0.005, output: 0.015 },
};

export class UsageTrackerService {
    static async track(params: UsageParams) {
        try {
            const { userId, model, tokensInput, tokensOutput, featureUsed } = params;

            // Calculate Cost
            const rates = RATES[model] || { input: 0, output: 0 };
            const costInput = (tokensInput / 1000) * rates.input;
            const costOutput = (tokensOutput / 1000) * rates.output;
            const totalCost = costInput + costOutput;

            const supabase = await createServiceRoleClient(); // Use service role preferably for logs

            const { error } = await supabase.from('ai_usage_logs').insert({
                user_id: userId,
                model,
                tokens_input: tokensInput,
                tokens_output: tokensOutput,
                cost_estimated: totalCost,
                feature_used: featureUsed
            });

            if (error) {
                console.error("Failed to log AI usage:", error);
                // Fail open: Don't block the user flow if logging fails
            }
        } catch (err) {
            console.error("Unexpected error logging AI usage:", err);
        }
    }
}
