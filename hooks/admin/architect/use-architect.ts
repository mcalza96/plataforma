'use client';

import { useState } from 'react';
import { useArchitectState } from './parts/use-architect-state';
import { useArchitectChat } from './parts/use-architect-chat';
import { useArchitectActions } from './parts/use-architect-actions';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

/**
 * useArchitect
 * Orchestrator hook that combines state, chat, and action sub-hooks.
 */
export function useArchitect(options?: {
    onProbeGenerated?: (probeId: string, metadata: { title: string, misconceptionIds: string[], options?: any[] }) => void,
    selectedBlockId?: string | null
}) {
    // 1. Core State Management
    const {
        state,
        setState,
        examTitle,
        setExamTitle,
        handleContextUpdate
    } = useArchitectState();

    // 2. Chat & Communication
    const [messages, setMessages] = useState<Message[]>([]);
    const {
        input,
        setInput,
        isLoading,
        setIsLoading,
        handleInputChange,
        handleSubmit
    } = useArchitectChat({
        stage: state.stage,
        messages,
        setMessages,
        onContextUpdate: handleContextUpdate,
        selectedBlockId: options?.selectedBlockId
    });

    // 3. Manual Actions (Publish, Generate, Reset)
    const {
        handleGenerate,
        handleGeneratePrototypes,
        handlePublish,
        handleReset
    } = useArchitectActions({
        state,
        setState,
        examTitle,
        setMessages,
        setInput,
        setIsLoading,
        onProbeGenerated: options?.onProbeGenerated
    });

    return {
        state,
        setState,
        messages,
        input,
        examTitle,
        setExamTitle,
        handleInputChange,
        handleSubmit,
        isLoading,
        handleGenerate,
        handleGeneratePrototypes,
        handlePublish,
        handleReset
    };
}
