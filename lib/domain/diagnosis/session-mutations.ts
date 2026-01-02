/**
 * Session Mutations - Métodos puros para modificar el estado de la sesión de diagnóstico.
 */

import {
    DiagnosticSessionState,
    CompetencyNode,
    Misconception,
    QMatrixEntry,
    ConversationTurn,
    CompetencyNodeSchema,
    MisconceptionSchema,
} from './types';

/**
 * Registra un nuevo concepto en el mapa de conocimiento
 */
export function registerConcept(
    session: DiagnosticSessionState,
    concept: CompetencyNode
): DiagnosticSessionState {
    const validatedConcept = CompetencyNodeSchema.parse(concept);

    const exists = session.knowledgeMap.concepts.some(
        (c) => c.id === validatedConcept.id
    );

    if (exists) {
        throw new Error(`El concepto con ID "${validatedConcept.id}" ya existe en el mapa`);
    }

    for (const depId of validatedConcept.dependencies) {
        const depExists = session.knowledgeMap.concepts.some((c) => c.id === depId);
        if (!depExists) {
            throw new Error(
                `La dependencia "${depId}" no existe en el mapa. Debe agregarse primero.`
            );
        }
    }

    return {
        ...session,
        knowledgeMap: {
            ...session.knowledgeMap,
            concepts: [...session.knowledgeMap.concepts, validatedConcept],
            lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
    };
}

/**
 * Registra un nuevo error conceptual (misconception) en el mapa
 */
export function registerMisconception(
    session: DiagnosticSessionState,
    misconception: Misconception
): DiagnosticSessionState {
    const validatedMisconception = MisconceptionSchema.parse(misconception);

    const relatedConceptExists = session.knowledgeMap.concepts.some(
        (c) => c.id === validatedMisconception.relatedConceptId
    );

    if (!relatedConceptExists) {
        throw new Error(
            `El concepto relacionado "${validatedMisconception.relatedConceptId}" no existe en el mapa`
        );
    }

    const exists = session.knowledgeMap.misconceptions.some(
        (m) => m.id === validatedMisconception.id
    );

    if (exists) {
        throw new Error(
            `El misconception con ID "${validatedMisconception.id}" ya existe en el mapa`
        );
    }

    return {
        ...session,
        knowledgeMap: {
            ...session.knowledgeMap,
            misconceptions: [
                ...session.knowledgeMap.misconceptions,
                validatedMisconception,
            ],
            lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
    };
}

/**
 * Registra un nuevo reactivo (probe) generado en la matriz Q
 */
export function registerProbe(
    session: DiagnosticSessionState,
    probe: Omit<QMatrixEntry, 'generatedAt'>
): DiagnosticSessionState {
    if (probe.targetType === 'concept') {
        const conceptExists = session.knowledgeMap.concepts.some(
            (c) => c.id === probe.targetId
        );
        if (!conceptExists) {
            throw new Error(`El concepto "${probe.targetId}" no existe en el mapa`);
        }
    } else if (probe.targetType === 'misconception') {
        const misconceptionExists = session.knowledgeMap.misconceptions.some(
            (m) => m.id === probe.targetId
        );
        if (!misconceptionExists) {
            throw new Error(`El misconception "${probe.targetId}" no existe en el mapa`);
        }
    }

    const exists = session.qMatrix.entries.some(
        (e) =>
            e.targetId === probe.targetId &&
            e.targetType === probe.targetType &&
            e.probeType === probe.probeType
    );

    if (exists) {
        throw new Error(
            `Ya existe un probe de tipo "${probe.probeType}" para ${probe.targetType} "${probe.targetId}"`
        );
    }

    const completeEntry: QMatrixEntry = {
        ...probe,
        generatedAt: new Date(),
    };

    return {
        ...session,
        qMatrix: {
            ...session.qMatrix,
            entries: [...session.qMatrix.entries, completeEntry],
            lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
    };
}

/**
 * Marca un misconception como validado
 */
export function validateMisconception(
    session: DiagnosticSessionState,
    misconceptionId: string
): DiagnosticSessionState {
    const misconceptionIndex = session.knowledgeMap.misconceptions.findIndex(
        (m) => m.id === misconceptionId
    );

    if (misconceptionIndex === -1) {
        throw new Error(`Misconception "${misconceptionId}" no encontrado`);
    }

    const updatedMisconceptions = [...session.knowledgeMap.misconceptions];
    updatedMisconceptions[misconceptionIndex] = {
        ...updatedMisconceptions[misconceptionIndex],
        validated: true,
    };

    return {
        ...session,
        knowledgeMap: {
            ...session.knowledgeMap,
            misconceptions: updatedMisconceptions,
            lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
    };
}

/**
 * Actualiza el nivel de maestría de un concepto
 */
export function updateMasteryLevel(
    session: DiagnosticSessionState,
    conceptId: string,
    masteryLevel: number
): DiagnosticSessionState {
    const conceptIndex = session.knowledgeMap.concepts.findIndex(
        (c) => c.id === conceptId
    );

    if (conceptIndex === -1) {
        throw new Error(`Concepto "${conceptId}" no encontrado`);
    }

    const updatedConcepts = [...session.knowledgeMap.concepts];
    updatedConcepts[conceptIndex] = {
        ...updatedConcepts[conceptIndex],
        masteryLevel,
        lastAssessed: new Date(),
    };

    return {
        ...session,
        knowledgeMap: {
            ...session.knowledgeMap,
            concepts: updatedConcepts,
            lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
    };
}

/**
 * Agrega un turno de conversación al historial
 */
export function addConversationTurn(
    session: DiagnosticSessionState,
    turn: ConversationTurn
): DiagnosticSessionState {
    return {
        ...session,
        conversationHistory: [...session.conversationHistory, turn],
        lastUpdated: new Date(),
    };
}
