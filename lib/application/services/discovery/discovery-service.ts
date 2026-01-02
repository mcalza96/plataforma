import { generateText, tool } from 'ai';
import { z } from 'zod';
import { AIProvider } from '@/lib/infrastructure/ai/ai-provider';
import { UPDATE_CONTEXT_TOOL_DEFINITION } from './constants';
import { buildInitialMessages, buildFollowUpMessages } from './message-builder';
import type { DiscoveryResponse } from './types';

/**
 * DiscoveryService - Curricular Architect Interview Engine
 * Standardized to use Vercel AI SDK and centralized AIProvider.
 */
export class DiscoveryService {
    /**
     * Continues the interview with the Curricular Architect
     */
    static async continueInterview(
        messages: any[],
        stage: string = 'initial_profiling',
        currentContext?: any,
        selectedBlockId?: string | null
    ): Promise<DiscoveryResponse> {
        const model = AIProvider.getModel();

        const coreMessages = messages as any[];
        const systemMessages = buildInitialMessages([], stage, currentContext, selectedBlockId);

        try {
            const { text, toolCalls } = await generateText({
                model,
                system: systemMessages.filter(m => m.role === 'system').map(m => (m as any).content).join('\n'),
                messages: coreMessages,
                tools: {
                    updateContext: {
                        description: UPDATE_CONTEXT_TOOL_DEFINITION.description,
                        parameters: UPDATE_CONTEXT_TOOL_DEFINITION.parameters,
                        execute: async (args: any) => args
                    } as any
                } as any,
                experimental_telemetry: { isEnabled: false }
            });

            const results = (toolCalls || []).map((tc: any) => ({
                toolCallId: tc.toolCallId,
                toolName: tc.toolName,
                args: tc.args as any,
                result: {
                    success: true,
                    updatedFields: Object.keys(tc.args as object)
                }
            }));

            return {
                role: 'assistant',
                content: text,
                toolCalls: results
            };
        } catch (error: any) {
            console.error('[DiscoveryService] AI Error:', error);
            throw error;
        }
    }
}
