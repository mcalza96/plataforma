'use client';

import { useState, useCallback } from 'react';
import {
    type ArchitectState,
    type PartialKnowledgeMap,
    INITIAL_ARCHITECT_STATE,
    calculateReadiness,
    getNextStage
} from '@/lib/domain/architect';
import { ContextReducer } from '@/lib/application/services/discovery/context-reducer';

export function useArchitectState() {
    const [state, setState] = useState<ArchitectState>(INITIAL_ARCHITECT_STATE);
    const [examTitle, setExamTitle] = useState("Nueva Evaluación de Diagnóstico");

    const handleContextUpdate = useCallback((update: Partial<PartialKnowledgeMap>) => {
        if (!update || typeof update !== 'object') {
            console.warn('[useArchitectState] Received invalid context update:', update);
            return;
        }

        setState(prev => {
            const updatedContext = ContextReducer.merge(prev.context, update);
            const newStage = getNextStage(prev.stage, updatedContext);
            const readiness = calculateReadiness(updatedContext);

            return {
                ...prev,
                context: updatedContext,
                stage: newStage,
                readiness,
                isCanvasReady: readiness.isValid
            };
        });
    }, []);

    return {
        state,
        setState,
        examTitle,
        setExamTitle,
        handleContextUpdate
    };
}
