/**
 * Session Manager - Gestor de Estado de Sesión de Diagnóstico
 * 
 * Orquestador que actúa como API interna para el Agente IA.
 * Proporciona métodos para modificar el estado de la sesión y
 * obtener instrucciones sobre qué hacer a continuación.
 */

import {
    DiagnosticSessionState,
    CompetencyNode,
    Misconception,
    QMatrixEntry,
    ConversationTurn,
    ProbeType,
    CompetencyNodeSchema,
    MisconceptionSchema,
} from './types';
import {
    calculateCoverage,
    getNextTask,
    generateCoverageReport,
} from './coverage-engine';

// ============================================================================
// SESSION MUTATIONS - Métodos para modificar el estado
// ============================================================================

/**
 * Registra un nuevo concepto en el mapa de conocimiento
 * 
 * @param session - Estado actual de la sesión
 * @param concept - Nodo de competencia a agregar
 * @returns Nueva sesión con el concepto agregado
 */
export function registerConcept(
    session: DiagnosticSessionState,
    concept: CompetencyNode
): DiagnosticSessionState {
    // Validar el concepto con Zod
    const validatedConcept = CompetencyNodeSchema.parse(concept);

    // Verificar que no exista ya
    const exists = session.knowledgeMap.concepts.some(
        (c) => c.id === validatedConcept.id
    );

    if (exists) {
        throw new Error(`El concepto con ID "${validatedConcept.id}" ya existe en el mapa`);
    }

    // Verificar que las dependencias existan
    for (const depId of validatedConcept.dependencies) {
        const depExists = session.knowledgeMap.concepts.some((c) => c.id === depId);
        if (!depExists) {
            throw new Error(
                `La dependencia "${depId}" no existe en el mapa. Debe agregarse primero.`
            );
        }
    }

    // Crear nueva sesión con el concepto agregado
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
 * 
 * @param session - Estado actual de la sesión
 * @param misconception - Error a agregar
 * @returns Nueva sesión con el error agregado
 */
export function registerMisconception(
    session: DiagnosticSessionState,
    misconception: Misconception
): DiagnosticSessionState {
    // Validar el misconception con Zod
    const validatedMisconception = MisconceptionSchema.parse(misconception);

    // Verificar que el concepto relacionado exista
    const relatedConceptExists = session.knowledgeMap.concepts.some(
        (c) => c.id === validatedMisconception.relatedConceptId
    );

    if (!relatedConceptExists) {
        throw new Error(
            `El concepto relacionado "${validatedMisconception.relatedConceptId}" no existe en el mapa`
        );
    }

    // Verificar que no exista ya
    const exists = session.knowledgeMap.misconceptions.some(
        (m) => m.id === validatedMisconception.id
    );

    if (exists) {
        throw new Error(
            `El misconception con ID "${validatedMisconception.id}" ya existe en el mapa`
        );
    }

    // Crear nueva sesión con el error agregado
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
 * 
 * @param session - Estado actual de la sesión
 * @param probe - Entrada de la matriz Q
 * @returns Nueva sesión con el probe agregado
 */
export function registerProbe(
    session: DiagnosticSessionState,
    probe: Omit<QMatrixEntry, 'generatedAt'>
): DiagnosticSessionState {
    // Validar que el target exista
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

    // Verificar que no exista ya un probe del mismo tipo para el mismo target
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

    // Crear la entrada completa
    const completeEntry: QMatrixEntry = {
        ...probe,
        generatedAt: new Date(),
    };

    // Crear nueva sesión con el probe agregado
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

// ============================================================================
// AGENT GUIDANCE - Métodos para guiar al Agente IA
// ============================================================================

/**
 * Obtiene la siguiente instrucción para el Agente IA
 * 
 * Esta es la función clave que el Agente llamará para saber qué hacer.
 * Devuelve un texto que se puede inyectar en el System Prompt.
 * 
 * @param session - Estado actual de la sesión
 * @returns Instrucción en texto plano para el Agente
 */
export function getNextObjective(session: DiagnosticSessionState): string {
    const nextTask = getNextTask(session);

    if (!nextTask) {
        return `✅ El diagnóstico está completo. Procede a sintetizar los hallazgos y generar el reporte final.`;
    }

    // Generar instrucción específica según el tipo de tarea
    switch (nextTask.type) {
        case 'EXPLORE_CONCEPTS':
            return `🔍 OBJETIVO PRIORITARIO: Exploración de Conceptos

Tu siguiente objetivo es identificar más conceptos fundamentales del área "${session.subjectArea}".

Razón: ${nextTask.reason}

Estrategia sugerida:
1. Pregunta al estudiante sobre temas generales del área
2. Identifica conceptos clave mencionados
3. Registra cada concepto usando registerConcept()
4. Pregunta por relaciones/dependencias entre conceptos

Ejemplo de pregunta: "¿Qué temas de ${session.subjectArea} has estudiado recientemente?"`;

        case 'GENERATE_MASTERY':
            const concept = session.knowledgeMap.concepts.find(
                (c) => c.id === nextTask.targetId
            );
            return `✅ OBJETIVO PRIORITARIO: Verificar Maestría

Tu siguiente objetivo es diseñar un reactivo positivo (MASTERY) para el concepto "${concept?.label}".

Razón: ${nextTask.reason}

Estrategia sugerida:
1. Diseña una pregunta que evalúe comprensión genuina del concepto
2. Incluye opciones que requieran aplicación, no solo memorización
3. Registra el reactivo usando registerProbe()
4. Administra la pregunta al estudiante

Descripción del concepto: ${concept?.description || 'No disponible'}`;

        case 'GENERATE_TRAP':
            const misconception = session.knowledgeMap.misconceptions.find(
                (m) => m.id === nextTask.targetId
            );
            return `🎯 OBJETIVO CRÍTICO: Diseñar Trampa (CBM)

Tu siguiente objetivo es diseñar un reactivo CBM (Certainty-Based Marking) para validar el error "${misconception?.label}".

Razón: ${nextTask.reason}

Estrategia sugerida:
1. Diseña una pregunta donde la respuesta INCORRECTA parezca correcta si el estudiante tiene este error
2. Incluye un distractor que refleje exactamente el misconception
3. Usa CBM: pide al estudiante que indique su nivel de certeza (0-100%)
4. Registra el reactivo usando registerProbe()
5. Si el estudiante cae en la trampa con alta certeza, marca el error como validado

Descripción del error: ${misconception?.description || 'No disponible'}
Severidad: ${misconception?.severity}`;

        case 'GENERATE_RANKING':
            const complexConcept = session.knowledgeMap.concepts.find(
                (c) => c.id === nextTask.targetId
            );
            return `📊 OBJETIVO: Evaluar Profundidad (Ranking)

Tu siguiente objetivo es diseñar un reactivo de RANKING para el concepto "${complexConcept?.label}".

Razón: ${nextTask.reason}

Estrategia sugerida:
1. Presenta una lista de conceptos relacionados (incluyendo las dependencias)
2. Pide al estudiante que los ordene por complejidad, prerequisitos, o secuencia lógica
3. Registra el reactivo usando registerProbe()
4. Evalúa si el estudiante comprende las relaciones jerárquicas

Dependencias del concepto: ${complexConcept?.dependencies.join(', ')}`;

        case 'VALIDATE_MISCONCEPTION':
            const misconceptionToValidate = session.knowledgeMap.misconceptions.find(
                (m) => m.id === nextTask.targetId
            );
            return `🔬 OBJETIVO: Validar Error Detectado

Tu siguiente objetivo es obtener evidencia adicional del error "${misconceptionToValidate?.label}".

Razón: ${nextTask.reason}

Estrategia sugerida:
1. Diseña una pregunta de seguimiento que confirme el patrón de error
2. Busca consistencia en las respuestas del estudiante
3. Si se confirma, marca como validado usando validateMisconception()
4. Si no se confirma, considera remover el misconception del mapa`;

        default:
            return `⚠️ Tarea desconocida: ${nextTask.type}`;
    }
}

/**
 * Genera un resumen del estado actual para el Agente
 */
export function getSessionSummary(session: DiagnosticSessionState): string {
    const { knowledgeMap, conversationHistory } = session;
    const coverageReport = generateCoverageReport(session);

    return `
📋 RESUMEN DE LA SESIÓN DE DIAGNÓSTICO

Estudiante: ${session.studentId}
Área: ${session.subjectArea}
Estado: ${session.status}

${coverageReport}

Mapa de Conocimiento:
  - Conceptos identificados: ${knowledgeMap.concepts.length}
  - Errores detectados: ${knowledgeMap.misconceptions.length}
  - Reactivos generados: ${session.qMatrix.entries.length}
  - Turnos de conversación: ${conversationHistory.length}

Última actualización: ${session.lastUpdated.toISOString()}
  `.trim();
}

/**
 * Verifica si una acción es válida en el estado actual
 */
export function canPerformAction(
    session: DiagnosticSessionState,
    action: 'add_concept' | 'add_misconception' | 'add_probe'
): { valid: boolean; reason?: string } {
    switch (action) {
        case 'add_concept':
            return { valid: true };

        case 'add_misconception':
            if (session.knowledgeMap.concepts.length === 0) {
                return {
                    valid: false,
                    reason: 'Debe haber al menos un concepto antes de agregar misconceptions',
                };
            }
            return { valid: true };

        case 'add_probe':
            if (
                session.knowledgeMap.concepts.length === 0 &&
                session.knowledgeMap.misconceptions.length === 0
            ) {
                return {
                    valid: false,
                    reason: 'Debe haber conceptos o misconceptions antes de generar probes',
                };
            }
            return { valid: true };

        default:
            return { valid: false, reason: 'Acción desconocida' };
    }
}
