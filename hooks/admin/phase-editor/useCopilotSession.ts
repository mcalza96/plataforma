'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { StepData } from '@/components/admin/StepCard';

export function useCopilotSession(
    lessonId: string,
    externalContext?: { selectedBlockId: string | null; currentSteps: any[] },
    onApplySuggestions?: (suggestions: { title: string }[]) => void
) {
    const [liveContext, setLiveContext] = useState<PartialKnowledgeMap>({
        keyConcepts: [],
        identifiedMisconceptions: []
    });

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        // @ts-ignore
        error
    } = useChat({
        api: '/api/discovery',
        body: {
            lessonId,
            externalContext
        },
        onToolCall({ toolCall }: { toolCall: any }) {
            if (toolCall.toolName === 'updateContext') {
                const args = toolCall.args as PartialKnowledgeMap;
                setLiveContext(prev => ({
                    ...prev,
                    ...args,
                    keyConcepts: Array.from(new Set([...(prev.keyConcepts || []), ...(args.keyConcepts || [])])),
                    identifiedMisconceptions: [...(prev.identifiedMisconceptions || []), ...(args.identifiedMisconceptions || [])]
                }));
            }

            if (toolCall.toolName === 'generateSteps') {
                const args = toolCall.args as { steps: { title: string }[] };
                onApplySuggestions?.(args.steps);
            }
        }
    } as any);

    const isLoading = status === 'submitted' || status === 'streaming';

    /**
     * append: Wrapper manual para enviar mensajes siguiendo la estructura del AI SDK 6.0
     */
    const append = async (message: { role: 'user'; content: string }) => {
        return await sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: message.content }]
        } as any);
    };

    const clearChat = () => setMessages([]);

    const messagesWithContent = messages.map(m => ({
        ...m,
        content: m.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') || ''
    }));

    const generateStepsFromSuggestions = (suggestions: { title: string }[]): StepData[] => {
        return suggestions.map((s, idx) => ({
            id: `ai-step-${Date.now()}-${idx}`,
            title: s.title,
            description: '',
            type: 'video',
            duration: 5
        }));
    };

    return {
        messages: messagesWithContent,
        isLoading,
        liveContext,
        clearChat,
        append,
        generateStepsFromSuggestions
    };
}

export type CopilotSessionHelper = ReturnType<typeof useCopilotSession>;
