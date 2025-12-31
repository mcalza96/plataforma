'use client';

import { useState, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import {
    type ArchitectState,
    type PartialKnowledgeMap,
    calculateReadiness,
} from '@/lib/domain/architect';
import { compileDiagnosticProbe } from '@/lib/architect-actions';

/**
 * useArchitect
 * Custom hook to manage the TeacherOS Architect session.
 * Syncs the Socratic Chat with the Knowledge Engineering Blueprint.
 */
export function useArchitect() {
    // 1. Local Input State (Since project useChat doesn't manage it)
    const [input, setInput] = useState('');

    // 2. Core Architect State
    const [state, setState] = useState<ArchitectState>({
        stage: 'initial_profiling',
        context: {
            subject: '',
            targetAudience: '',
            keyConcepts: [],
            identifiedMisconceptions: [],
            pedagogicalGoal: ''
        },
        readiness: {
            hasTargetAudience: false,
            conceptCount: 0,
            misconceptionCount: 0,
            isValid: false
        },
        isGenerating: false
    });

    // 3. Context Update Logic
    const handleContextUpdate = useCallback((newContext: PartialKnowledgeMap) => {
        setState(prev => {
            const updatedContext = {
                ...prev.context,
                ...newContext,
                keyConcepts: Array.from(new Set([...prev.context.keyConcepts, ...(newContext.keyConcepts || [])])),
                identifiedMisconceptions: [
                    ...prev.context.identifiedMisconceptions,
                    ...(newContext.identifiedMisconceptions || []).filter(
                        (nm: any) => !prev.context.identifiedMisconceptions.some(pm => pm.error === nm.error)
                    )
                ]
            };

            let newStage = prev.stage;
            if (updatedContext.identifiedMisconceptions.length > 0) {
                newStage = 'shadow_work';
            } else if (updatedContext.keyConcepts.length > 0) {
                newStage = 'concept_extraction';
            }

            return {
                ...prev,
                context: updatedContext,
                stage: newStage,
                readiness: calculateReadiness(updatedContext)
            };
        });
    }, []);

    // 4. Vercel AI SDK useChat Integration
    const chat: any = (useChat as any)({
        api: '/api/chat',
        onToolCall({ toolCall }: any) {
            if (toolCall.toolName === 'updateContext') {
                handleContextUpdate(toolCall.args as PartialKnowledgeMap);
            }
        }
    });

    // 5. Message Normalization
    const normalizedMessages = useMemo(() => {
        return (chat.messages || []).map((m: any) => ({
            ...m,
            content: m.content || m.parts
                ?.filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('') || ''
        }));
    }, [chat.messages]);

    // 6. Manual Helpers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || chat.status === 'submitted' || chat.status === 'streaming') return;

        const currentInput = input;
        setInput(''); // Optimistic clear

        try {
            await chat.sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: currentInput }]
            });
        } catch (err) {
            console.error("[useArchitect] Send failed:", err);
            setInput(currentInput); // Rollback
        }
    }, [input, chat]);

    const handleGenerate = async () => {
        if (!state.readiness.isValid) return;
        setState(prev => ({ ...prev, isGenerating: true }));

        try {
            const result = await compileDiagnosticProbe(state);
            if (result.success && result.probeId) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    generatedProbeId: result.probeId
                }));
                console.log("[useArchitect] Success! Probe generated:", result.probeId);
            } else {
                throw new Error(result.error || "Falla en la compilación");
            }
        } catch (error: any) {
            console.error("[useArchitect] Generation error:", error);
            setState(prev => ({ ...prev, isGenerating: false }));
            alert(error.message || "No se pudo generar el diagnóstico. Intenta de nuevo.");
        }
    };

    return {
        state,
        messages: normalizedMessages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading: chat.status === 'submitted' || chat.status === 'streaming',
        handleGenerate
    };
}
