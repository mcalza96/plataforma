'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    type ArchitectState,
    type PartialKnowledgeMap,
    calculateReadiness,
} from '@/lib/domain/architect';
import { compileDiagnosticProbe } from '@/lib/architect-actions';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

/**
 * useArchitect
 * Custom hook to manage the TeacherOS Architect session.
 * Uses direct fetch to /api/chat instead of AI SDK's useChat for Groq SDK compatibility.
 */
export function useArchitect() {
    // 1. Local Input State
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
        if (!newContext || typeof newContext !== 'object') {
            console.warn('[useArchitect] Received invalid context update:', newContext);
            return;
        }

        setState(prev => {
            const updatedContext = {
                ...prev.context,
                subject: newContext.subject ?? prev.context.subject,
                targetAudience: newContext.targetAudience ?? prev.context.targetAudience,
                pedagogicalGoal: newContext.pedagogicalGoal ?? prev.context.pedagogicalGoal,
                keyConcepts: Array.from(new Set([
                    ...(prev.context.keyConcepts || []),
                    ...(newContext.keyConcepts || [])
                ])),
                identifiedMisconceptions: [
                    ...(prev.context.identifiedMisconceptions || []),
                    ...(newContext.identifiedMisconceptions || []).filter(
                        (nm: any) => !(prev.context.identifiedMisconceptions || []).some(pm => pm.error === nm.error)
                    )
                ]
            };

            let newStage = prev.stage;
            if (updatedContext.identifiedMisconceptions.length > 0) {
                newStage = 'shadow_work';
            } else if (updatedContext.keyConcepts.length > 0) {
                newStage = 'concept_extraction';
            } else if (updatedContext.subject && updatedContext.targetAudience) {
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

    // 4. Manual Helpers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    // 5. Send message using direct fetch (for Groq SDK compatibility)
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim()
        };

        // Optimistic update
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
                    }))
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('[useArchitect] Response:', data);

            // Process tool calls if present
            if (data.toolCalls && Array.isArray(data.toolCalls)) {
                for (const tc of data.toolCalls) {
                    if (tc.toolName === 'updateContext' && tc.args) {
                        console.log('[useArchitect] Processing tool call:', tc.args);
                        handleContextUpdate(tc.args as PartialKnowledgeMap);
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
            console.error("[useArchitect] Send failed:", err);
            setInput(currentInput); // Rollback input
            setMessages(prev => prev.filter(m => m.id !== userMessage.id)); // Rollback message
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, handleContextUpdate]);

    // 6. Generate Diagnostic
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
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        handleGenerate
    };
}
