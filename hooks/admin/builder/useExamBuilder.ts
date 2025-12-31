"use client";

import { useState, useCallback, useMemo } from "react";

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

export interface BuilderState {
    isChatting: boolean;
    matrix: {
        concepts: Concept[];
        misconceptions: Misconception[];
    };
}

export function useExamBuilder() {
    const [state, setState] = useState<BuilderState>({
        isChatting: false,
        matrix: {
            concepts: [],
            misconceptions: [],
        },
    });

    const [examTitle, setExamTitle] = useState("Nuevo Examen de Diagnóstico");

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

    const canPublish = useMemo(() => {
        const hasEnoughConcepts = state.matrix.concepts.length >= 3;
        const hasAtLeastOneTrap = state.matrix.misconceptions.some((m) => m.hasTrap);
        return hasEnoughConcepts && hasAtLeastOneTrap;
    }, [state.matrix]);

    return {
        state,
        examTitle,
        setExamTitle,
        addConcept,
        updateConceptStatus,
        addMisconception,
        toggleTrap,
        canPublish,
        setState, // For manual overrides from chat tool calls
    };
}
