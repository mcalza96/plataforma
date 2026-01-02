'use client';

import { useState, useCallback } from 'react';
import { type Message } from '../use-architect'; // Let's keep the type there or move it to a shared place
import { type PartialKnowledgeMap } from '@/lib/domain/architect';

interface UseArchitectChatProps {
    stage: string;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onContextUpdate: (update: Partial<PartialKnowledgeMap>) => void;
    selectedBlockId?: string | null;
}

export function useArchitectChat({
    stage,
    messages,
    setMessages,
    onContextUpdate,
    selectedBlockId
}: UseArchitectChatProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim()
        };

        const currentInput = input;
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    stage,
                    selectedBlockId
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Process tool calls
            if (data.toolCalls && Array.isArray(data.toolCalls)) {
                for (const tc of data.toolCalls) {
                    if (tc.toolName === 'updateContext' && tc.args) {
                        onContextUpdate(tc.args as PartialKnowledgeMap);
                    }
                }
            }

            // Add assistant message
            if (data.content || data.message) {
                const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.content || data.message || ''
                };
                setMessages(prev => [...prev, assistantMessage]);
            }

        } catch (err: any) {
            console.error("[useArchitectChat] Send failed:", err);
            setInput(currentInput);
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, stage, onContextUpdate, selectedBlockId, setMessages]);

    return {
        input,
        setInput,
        isLoading,
        setIsLoading,
        handleInputChange,
        handleSubmit
    };
}
