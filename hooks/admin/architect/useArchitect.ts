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

            // FSM Transitions - Robust logic
            const hasSubjectAndTarget = updatedContext.subject && (updatedContext.targetAudience || updatedContext.studentProfile);

            if (hasSubjectAndTarget && prev.stage === 'initial_profiling') {
                newStage = 'content_definition';
            }

            if (updatedContext.contentPreference && newStage === 'content_definition') {
                newStage = 'concept_extraction';
            }

            if (updatedContext.keyConcepts.length >= 2 && newStage === 'concept_extraction') {
                newStage = 'shadow_work';
            }

            if (updatedContext.identifiedMisconceptions.length >= 1 && newStage === 'shadow_work') {
                newStage = 'exam_configuration';
            }

            if (updatedContext.examConfig?.questionCount && newStage === 'exam_configuration') {
                newStage = 'synthesis';
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
                    })),
                    stage: state.stage // Pass current FSM stage to API
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

    // 6. Generate Prototypes
    const handleGeneratePrototypes = async () => {
        setState(prev => ({ ...prev, isGenerating: true }));

        try {
            const { generatePrototypes } = await import('@/lib/architect-actions');
            const result = await generatePrototypes(state);

            if (result.success && result.prototypes) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    context: {
                        ...prev.context,
                        prototypes: result.prototypes
                    }
                }));
            } else {
                throw new Error(result.error || "Falla en la generación de prototipos");
            }
        } catch (error: any) {
            console.error("[useArchitect] Prototype generation error:", error);
            setState(prev => ({ ...prev, isGenerating: false }));
            alert(error.message || "No se pudo generar los prototipos. Intenta de nuevo.");
        }
    };

    // 7. Generate Final Diagnostic
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

    // 0. Constructor Extensions
    const [examTitle, setExamTitle] = useState("Nueva Evaluación de Diagnóstico");

    // 8. Publish Exam
    const handlePublish = async () => {
        if (!state.readiness.isValid) return;
        setState(prev => ({ ...prev, isGenerating: true }));

        try {
            const { publishExam } = await import("@/lib/actions/exam-actions");
            const result = await publishExam({
                title: examTitle,
                matrix: state.context,
                // If we have prototypes, we could potentially use them or just use the generated probe
                questions: state.context.prototypes as any[]
            });

            if (result.success) {
                alert(`¡Examen publicado con éxito!`);
                return result;
            } else {
                throw new Error(result.error || "Falla al publicar");
            }
        } catch (error: any) {
            console.error("[useArchitect] Publish error:", error);
            alert(error.message || "No se pudo publicar el examen.");
        } finally {
            setState(prev => ({ ...prev, isGenerating: false }));
        }
    };

    // 9. Reset Session
    const handleReset = async () => {
        console.log("[useArchitect] Resetting session...");
        setIsLoading(true);
        try {
            const { resetDiscoveryContext } = await import("@/lib/actions/discovery-actions");
            const result = await resetDiscoveryContext();
            if (result.success) {
                console.log("[useArchitect] Reset success in DB");
                setMessages([]);
                setState({
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
                setInput('');
            } else {
                throw new Error(result.error || "Falla al reiniciar");
            }
        } catch (error: any) {
            console.error("[useArchitect] Reset error:", error);
            alert(error.message || "No se pudo reiniciar la sesión.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state,
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
