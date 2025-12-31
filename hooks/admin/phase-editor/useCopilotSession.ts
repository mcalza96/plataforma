'use client';

import { useState, useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { StepData } from '@/components/admin/StepCard';

/**
 * Utility to transform AI suggestions into UI StepData
 */
export const generateStepsFromSuggestions = (suggestions: { title: string }[]): StepData[] => {
    return suggestions.map((s, idx) => ({
        id: `ai-step-${Date.now()}-${idx}`,
        title: s.title,
        description: '',
        type: 'video',
        duration: 5
    }));
};

export function useCopilotSession(
    lessonId: string,
    externalContext?: { selectedBlockId: string | null; currentSteps: any[] },
    onApplySuggestions?: (suggestions: { title: string }[]) => void
) {
    const [liveContext, setLiveContext] = useState<PartialKnowledgeMap>({
        keyConcepts: [],
        identifiedMisconceptions: []
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    const handleToolCall = useCallback(async ({ toolCall }: { toolCall: any }) => {
        const args = toolCall.args;
        if (!args) return;

        if (toolCall.toolName === 'updateContext') {
            const mapArgs = args as PartialKnowledgeMap;

            // 1. Update Local State (Additive & Deduplicated)
            setLiveContext(prev => {
                // Merge concepts
                const newConcepts = Array.from(new Set([...(prev.keyConcepts || []), ...(mapArgs.keyConcepts || [])]));

                // Merge misconceptions (deduplicate by error text)
                const existingErrors = new Set(prev.identifiedMisconceptions?.map(m => m.error));
                const uniqueNewMisconceptions = (mapArgs.identifiedMisconceptions || [])
                    .filter(m => !existingErrors.has(m.error));

                const mergedMisconceptions = [
                    ...(prev.identifiedMisconceptions || []),
                    ...uniqueNewMisconceptions
                ];

                return {
                    ...prev,
                    ...mapArgs, // Keeps subject, audience, etc. (latest wins)
                    keyConcepts: newConcepts,
                    identifiedMisconceptions: mergedMisconceptions
                };
            });

            // 2. Persist to DB (Server Action)
            try {
                setIsSyncing(true);
                const { saveDiscoveryContext } = await import('@/lib/ai-actions');
                await saveDiscoveryContext(lessonId, mapArgs);
                setLastSyncedAt(new Date());
            } catch (err) {
                console.error("[useCopilotSession] Persistence failed:", err);
            } finally {
                setIsSyncing(false);
            }
        }

        if (toolCall.toolName === 'generateSteps') {
            const stepArgs = args as { steps: { title: string }[] };
            onApplySuggestions?.(stepArgs.steps);
        }
    }, [lessonId, onApplySuggestions]);

    const body = useMemo(() => ({
        lessonId,
        externalContext
    }), [lessonId, externalContext]);

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        error
    } = useChat({
        api: '/api/chat',
        body,
        onToolCall: handleToolCall
    } as any);

    const isLoading = status === 'submitted' || status === 'streaming';

    /**
     * Custom append implementation using sendMessage from @ai-sdk/react@3.0.3
     */
    const append = useCallback(async (message: { role: 'user'; content: string }) => {
        return await sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: message.content }]
        } as any);
    }, [sendMessage]);

    const clearChat = useCallback(() => setMessages([]), [setMessages]);

    const messagesWithContent = useMemo(() => messages.map(m => ({
        ...m,
        content: m.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') || ''
    })), [messages]);

    return {
        messages: messagesWithContent,
        isLoading,
        error,
        liveContext,
        isSyncing,
        lastSyncedAt,
        clearChat,
        append
    };
}

export type CopilotSessionHelper = ReturnType<typeof useCopilotSession>;
