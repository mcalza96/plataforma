'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { PartialKnowledgeMap } from '@/lib/domain/discovery';
import { StepData } from '@/components/admin/StepCard';

export function useCopilotSession(lessonId: string) {
    const [liveContext, setLiveContext] = useState<PartialKnowledgeMap>({
        keyConcepts: [],
        identifiedMisconceptions: []
    });

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setMessages
    } = useChat({
        api: '/api/discovery',
        body: { lessonId },
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
        }
    });

    const clearChat = () => setMessages([]);

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
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        liveContext,
        clearChat,
        generateStepsFromSuggestions
    };
}

export type CopilotSessionHelper = ReturnType<typeof useCopilotSession>;
