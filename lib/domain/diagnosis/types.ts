/**
 * Domain Types for Diagnostic Session State
 * 
 * Este módulo define el estado completo de una sesión de diagnóstico,
 * incluyendo el mapa de conocimiento, la matriz Q y el historial.
 */

import { z } from 'zod';

// ============================================================================
// KNOWLEDGE MAP - Representación del conocimiento del estudiante
// ============================================================================

/**
 * Nodo de competencia: representa un concepto que el estudiante debe dominar
 */
export const CompetencyNodeSchema = z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    dependencies: z.array(z.string()), // IDs de otros nodos que son prerequisitos
    masteryLevel: z.number().min(0).max(1).default(0), // 0 = no evaluado, 1 = dominado
    lastAssessed: z.date().optional(),
});

export type CompetencyNode = z.infer<typeof CompetencyNodeSchema>;

/**
 * Misconception: error conceptual detectado durante la entrevista
 */
export const MisconceptionSchema = z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    relatedConceptId: z.string(), // ID del concepto donde se detectó el error
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    detectedAt: z.date(),
    validated: z.boolean().default(false), // ¿Ya se validó con un reactivo específico?
});

export type Misconception = z.infer<typeof MisconceptionSchema>;

/**
 * KnowledgeMap: el mapa mental completo del estudiante
 */
export const KnowledgeMapSchema = z.object({
    concepts: z.array(CompetencyNodeSchema),
    misconceptions: z.array(MisconceptionSchema),
    lastUpdated: z.date(),
});

export type KnowledgeMap = z.infer<typeof KnowledgeMapSchema>;

// ============================================================================
// Q-MATRIX INVENTORY - Registro de ítems generados
// ============================================================================

/**
 * Tipos de reactivos (Probes) que podemos generar
 */
export const ProbeTypeSchema = z.enum([
    'CBM',        // Certainty-Based Marking (trampa con distractor)
    'RANKING',    // Ordenar conceptos por dependencia/complejidad
    'OPEN',       // Pregunta abierta para profundizar
    'MASTERY',    // Reactivo positivo para verificar dominio
]);

export type ProbeType = z.infer<typeof ProbeTypeSchema>;

/**
 * Entrada en la Matriz Q: un ítem generado para un concepto o error
 */
export const QMatrixEntrySchema = z.object({
    targetId: z.string(), // ID del concepto o misconception
    targetType: z.enum(['concept', 'misconception']),
    probeId: z.string().optional(), // ID del reactivo generado (si existe)
    probeType: ProbeTypeSchema.optional(),
    generatedAt: z.date().optional(),
    administered: z.boolean().default(false), // ¿Ya se le preguntó al estudiante?
});

export type QMatrixEntry = z.infer<typeof QMatrixEntrySchema>;

/**
 * QMatrixInventory: registro completo de todos los ítems
 */
export const QMatrixInventorySchema = z.object({
    entries: z.array(QMatrixEntrySchema),
    lastUpdated: z.date(),
});

export type QMatrixInventory = z.infer<typeof QMatrixInventorySchema>;

// ============================================================================
// CONVERSATION HISTORY - Historial de la entrevista
// ============================================================================

export const ConversationTurnSchema = z.object({
    id: z.string(),
    role: z.enum(['agent', 'student']),
    content: z.string(),
    timestamp: z.date(),
    metadata: z.record(z.string(), z.unknown()).optional(), // Datos adicionales (ej: intención detectada)
});

export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;

// ============================================================================
// DIAGNOSTIC SESSION STATE - Estado global de la sesión
// ============================================================================

export const DiagnosticSessionStateSchema = z.object({
    sessionId: z.string(),
    studentId: z.string(),
    subjectArea: z.string(), // Ej: "Álgebra Lineal", "Cálculo I"
    knowledgeMap: KnowledgeMapSchema,
    qMatrix: QMatrixInventorySchema,
    conversationHistory: z.array(ConversationTurnSchema),
    createdAt: z.date(),
    lastUpdated: z.date(),
    status: z.enum(['active', 'completed', 'paused']),
});

export type DiagnosticSessionState = z.infer<typeof DiagnosticSessionStateSchema>;

// ============================================================================
// PENDING TASKS - Tareas que el Coverage Engine identifica
// ============================================================================

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskTypeSchema = z.enum([
    'EXPLORE_CONCEPTS',      // Necesitamos más conceptos base
    'GENERATE_MASTERY',      // Crear reactivo positivo para un concepto
    'GENERATE_TRAP',         // Crear reactivo negativo (CBM) para un error
    'GENERATE_RANKING',      // Crear reactivo de ordenamiento
    'VALIDATE_MISCONCEPTION', // Confirmar un error con evidencia adicional
]);

export type TaskType = z.infer<typeof TaskTypeSchema>;

export const PendingTaskSchema = z.object({
    id: z.string(),
    type: TaskTypeSchema,
    priority: TaskPrioritySchema,
    targetId: z.string().optional(), // ID del concepto o error relacionado
    reason: z.string(), // Explicación de por qué se necesita esta tarea
    suggestedProbeType: ProbeTypeSchema.optional(),
});

export type PendingTask = z.infer<typeof PendingTaskSchema>;

// ============================================================================
// HELPER FUNCTIONS - Utilidades para crear objetos de dominio
// ============================================================================

/**
 * Crea una sesión de diagnóstico vacía
 */
export function createEmptySession(
    sessionId: string,
    studentId: string,
    subjectArea: string
): DiagnosticSessionState {
    const now = new Date();

    return {
        sessionId,
        studentId,
        subjectArea,
        knowledgeMap: {
            concepts: [],
            misconceptions: [],
            lastUpdated: now,
        },
        qMatrix: {
            entries: [],
            lastUpdated: now,
        },
        conversationHistory: [],
        createdAt: now,
        lastUpdated: now,
        status: 'active',
    };
}

/**
 * Crea un nuevo nodo de competencia
 */
export function createCompetencyNode(
    id: string,
    label: string,
    description?: string,
    dependencies: string[] = []
): CompetencyNode {
    return {
        id,
        label,
        description,
        dependencies,
        masteryLevel: 0,
    };
}

/**
 * Crea un nuevo misconception
 */
export function createMisconception(
    id: string,
    label: string,
    description: string,
    relatedConceptId: string,
    severity: Misconception['severity'] = 'medium'
): Misconception {
    return {
        id,
        label,
        description,
        relatedConceptId,
        severity,
        detectedAt: new Date(),
        validated: false,
    };
}
