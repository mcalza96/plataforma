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

    const body = useMemo(() => ({
        lessonId,
        externalContext
    }), [lessonId, externalContext]);

    const handleToolCall = useCallback(({ toolCall }: { toolCall: any }) => {
        const args = toolCall.args;
        if (!args) return;

        if (toolCall.toolName === 'updateContext') {
            const mapArgs = args as PartialKnowledgeMap;
            setLiveContext(prev => ({
                ...prev,
                ...mapArgs,
                keyConcepts: Array.from(new Set([...(prev.keyConcepts || []), ...(mapArgs.keyConcepts || [])])),
                identifiedMisconceptions: [...(prev.identifiedMisconceptions || []), ...(mapArgs.identifiedMisconceptions || [])]
            }));
        }

        if (toolCall.toolName === 'generateSteps') {
            const stepArgs = args as { steps: { title: string }[] };
            onApplySuggestions?.(stepArgs.steps);
        }
    }, [onApplySuggestions]);

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
     * append: Wrapper manual para enviar mensajes siguiendo la estructura del AI SDK
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
        clearChat,
        append
    };
}

export type CopilotSessionHelper = ReturnType<typeof useCopilotSession>;
