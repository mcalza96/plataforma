"use client";

import React, { useState, useEffect } from "react";
import { PedagogicalChat } from "../shared/PedagogicalChat";

interface ConfigChatProps {
    examTitle: string;
    stage: string;
    matrix: {
        subject?: string;
        targetAudience?: string;
        pedagogicalGoal?: string;
        concepts: Array<{ id: string; name: string; status: string }>;
        misconceptions: Array<{ id: string; description: string; hasTrap: boolean }>;
    };
    onUpdateState: (toolCall: any) => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ConfigChat({ examTitle, stage, matrix, onUpdateState }: ConfigChatProps) {
    const [localInput, setLocalInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleSubmitLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput?.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: localInput
        };

        setMessages(prev => [...prev, userMessage]);
        setLocalInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    examId: 'temp-config',
                    stage: stage,
                    context: {
                        subject: matrix.subject,
                        targetAudience: matrix.targetAudience,
                        pedagogicalGoal: matrix.pedagogicalGoal,
                        keyConcepts: matrix.concepts.map((c: any) => c.name),
                        identifiedMisconceptions: matrix.misconceptions.map((m: any) => ({
                            error: m.description,
                            distractor_artifact: m.hasTrap ? m.description : undefined
                        }))
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle tool calls if present
            if (data.toolCalls && data.toolCalls.length > 0) {
                data.toolCalls.forEach((toolCall: any) => {
                    onUpdateState({ method: toolCall.toolName, args: toolCall.args });
                });
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.content || ''
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('[ConfigChat] Error:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PedagogicalChat
            messages={messages}
            input={localInput}
            handleInputChange={(e) => setLocalInput(e.target.value)}
            handleSubmit={handleSubmitLocal}
            isLoading={isLoading}
            error={error}
            placeholder="Describe el tema del examen..."
            emptyStateTitle="Arquitecto de Diagnósticos"
            emptyStateDescription="Describe el tema del examen para que el Agente pueda mapear los conceptos y detectar posibles confusiones."
        />
    );
}
