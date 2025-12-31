"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

export interface Concept {
    id: string;
    name: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COVERED';
}

export interface Misconception {
    id: string;
    description: string;
    hasTrap: boolean;
}

export type BuilderStage = 'initial_profiling' | 'concept_extraction' | 'shadow_work' | 'synthesis';

export interface BuilderState {
    isChatting: boolean;
    stage: BuilderStage;
    matrix: {
        subject?: string;
        targetAudience?: string;
        pedagogicalGoal?: string;
        concepts: Concept[];
        misconceptions: Misconception[];
    };
}

export function useExamBuilder() {
    const [state, setState] = useState<BuilderState>({
        isChatting: false,
        stage: 'initial_profiling',
        matrix: {
            concepts: [],
            misconceptions: [],
        },
    });

    const [examTitle, setExamTitle] = useState("Nuevo Examen de Diagnóstico");
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    // Calculate readiness for publication (0-100)
    const readiness = useMemo(() => {
        let score = 0;
        if (state.matrix.subject) score += 10;
        if (state.matrix.targetAudience) score += 10;
        if (state.matrix.pedagogicalGoal) score += 10;

        // Max 40 for concepts (need at least 3)
        const conceptCount = state.matrix.concepts.length;
        score += Math.min(conceptCount * 13, 40);

        // Max 30 for misconceptions with traps (need at least 1)
        const trapCount = state.matrix.misconceptions.filter(m => m.hasTrap).length;
        score += Math.min(trapCount * 30, 30);

        return Math.min(score, 100);
    }, [state.matrix]);

    const canPublish = readiness >= 100;

    // Automatic FSM stage transitions based on completeness
    useEffect(() => {
        if (state.stage === 'initial_profiling' && state.matrix.subject && state.matrix.targetAudience) {
            setState(prev => ({ ...prev, stage: 'concept_extraction' }));
        } else if (state.stage === 'concept_extraction' && state.matrix.concepts.length >= 3) {
            setState(prev => ({ ...prev, stage: 'shadow_work' }));
        } else if (state.stage === 'shadow_work' && state.matrix.misconceptions.length >= 1) {
            setState(prev => ({ ...prev, stage: 'synthesis' }));
        }
    }, [state.matrix, state.stage]);

    const addConcept = useCallback((name: string) => {
        setState((prev) => ({
            ...prev,
            matrix: {
                ...prev.matrix,
                concepts: [
                    ...prev.matrix.concepts,
                    { id: crypto.randomUUID(), name, status: 'PENDING' },
                ],
            },
        }));
    }, []);

    const updateConceptStatus = useCallback((id: string, status: Concept['status']) => {
        setState((prev) => ({
            ...prev,
            matrix: {
                ...prev.matrix,
                concepts: prev.matrix.concepts.map((c) =>
                    c.id === id ? { ...c, status } : c
                ),
            },
        }));
    }, []);

    const addMisconception = useCallback((description: string) => {
        setState((prev) => ({
            ...prev,
            matrix: {
                ...prev.matrix,
                misconceptions: [
                    ...prev.matrix.misconceptions,
                    { id: crypto.randomUUID(), description, hasTrap: false },
                ],
            },
        }));
    }, []);

    const toggleTrap = useCallback((id: string) => {
        setState((prev) => ({
            ...prev,
            matrix: {
                ...prev.matrix,
                misconceptions: prev.matrix.misconceptions.map((m) =>
                    m.id === id ? { ...m, hasTrap: !m.hasTrap } : m
                ),
            },
        }));
    }, []);

    const handleSync = useCallback(() => {
        setLastSyncedAt(new Date());
    }, []);

    return {
        state,
        examTitle,
        setExamTitle,
        addConcept,
        updateConceptStatus,
        addMisconception,
        toggleTrap,
        readiness,
        canPublish,
        lastSyncedAt,
        handleSync,
        setState,
    };
}
