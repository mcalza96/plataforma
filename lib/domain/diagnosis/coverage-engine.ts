/**
 * Coverage Engine - Motor de Cobertura
 * 
 * Lógica pura que calcula qué preguntas (Probes) faltan para tener
 * un diagnóstico válido, basándose en las "Reglas de Oro".
 */

import {
    DiagnosticSessionState,
    PendingTask,
    TaskPriority,
    CompetencyNode,
    Misconception,
    QMatrixEntry,
} from './types';

// ============================================================================
// REGLAS DE ORO - Business Logic del Coverage Engine
// ============================================================================

/**
 * Regla de Maestría:
 * Cada CompetencyNode debe tener al menos 1 reactivo positivo (MASTERY)
 * para verificar que el estudiante realmente sabe el concepto.
 * Prioridad: Media
 */
function applyMasteryRule(
    concepts: CompetencyNode[],
    qMatrix: QMatrixEntry[]
): PendingTask[] {
    const tasks: PendingTask[] = [];

    for (const concept of concepts) {
        // Verificar si ya existe un reactivo de maestría para este concepto
        const hasMasteryProbe = qMatrix.some(
            (entry) =>
                entry.targetId === concept.id &&
                entry.targetType === 'concept' &&
                entry.probeType === 'MASTERY'
        );

        if (!hasMasteryProbe) {
            tasks.push({
                id: `mastery-${concept.id}`,
                type: 'GENERATE_MASTERY',
                priority: 'medium',
                targetId: concept.id,
                reason: `El concepto "${concept.label}" necesita un reactivo positivo para verificar dominio`,
                suggestedProbeType: 'MASTERY',
            });
        }
    }

    return tasks;
}

/**
 * Regla de Sombra:
 * Cada Misconception detectado DEBE tener 1 reactivo negativo específico (CBM)
 * para validar que el error realmente existe.
 * Prioridad: Alta (Crítico si no está validado)
 */
function applyShadowRule(
    misconceptions: Misconception[],
    qMatrix: QMatrixEntry[]
): PendingTask[] {
    const tasks: PendingTask[] = [];

    for (const misconception of misconceptions) {
        // Verificar si ya existe un reactivo CBM para este error
        const hasTrapProbe = qMatrix.some(
            (entry) =>
                entry.targetId === misconception.id &&
                entry.targetType === 'misconception' &&
                entry.probeType === 'CBM'
        );

        if (!hasTrapProbe) {
            // Prioridad crítica si el error no está validado
            const priority: TaskPriority = misconception.validated ? 'high' : 'critical';

            tasks.push({
                id: `trap-${misconception.id}`,
                type: 'GENERATE_TRAP',
                priority,
                targetId: misconception.id,
                reason: `El error "${misconception.label}" necesita un reactivo CBM para validación`,
                suggestedProbeType: 'CBM',
            });
        }
    }

    return tasks;
}

/**
 * Regla de Profundidad:
 * Si un concepto tiene > 3 dependencias, sugiere un reactivo de RANKING
 * para evaluar si el estudiante comprende el orden/jerarquía.
 * Prioridad: Baja (es un nice-to-have)
 */
function applyDepthRule(
    concepts: CompetencyNode[],
    qMatrix: QMatrixEntry[]
): PendingTask[] {
    const tasks: PendingTask[] = [];

    for (const concept of concepts) {
        if (concept.dependencies.length > 3) {
            // Verificar si ya existe un reactivo de ranking
            const hasRankingProbe = qMatrix.some(
                (entry) =>
                    entry.targetId === concept.id &&
                    entry.targetType === 'concept' &&
                    entry.probeType === 'RANKING'
            );

            if (!hasRankingProbe) {
                tasks.push({
                    id: `ranking-${concept.id}`,
                    type: 'GENERATE_RANKING',
                    priority: 'low',
                    targetId: concept.id,
                    reason: `El concepto "${concept.label}" tiene ${concept.dependencies.length} dependencias, sugiere evaluar orden/jerarquía`,
                    suggestedProbeType: 'RANKING',
                });
            }
        }
    }

    return tasks;
}

/**
 * Regla de Exploración:
 * Si el mapa de conocimiento está vacío o tiene muy pocos conceptos,
 * la prioridad es explorar más antes de generar reactivos.
 */
function applyExplorationRule(concepts: CompetencyNode[]): PendingTask[] {
    const MIN_CONCEPTS = 3; // Mínimo de conceptos antes de empezar a evaluar

    if (concepts.length < MIN_CONCEPTS) {
        return [
            {
                id: 'explore-concepts',
                type: 'EXPLORE_CONCEPTS',
                priority: 'critical',
                reason: `Solo se han identificado ${concepts.length} conceptos. Se necesitan al menos ${MIN_CONCEPTS} para un diagnóstico válido`,
            },
        ];
    }

    return [];
}

// ============================================================================
// COVERAGE ENGINE - Función Principal
// ============================================================================

/**
 * Calcula qué tareas faltan para tener un diagnóstico completo.
 * 
 * Esta es una función PURA: no tiene efectos secundarios, solo transforma datos.
 * 
 * @param state - Estado actual de la sesión de diagnóstico
 * @returns Array de tareas pendientes, ordenadas por prioridad
 */
export function calculateCoverage(
    state: DiagnosticSessionState
): PendingTask[] {
    const { knowledgeMap, qMatrix } = state;
    const { concepts, misconceptions } = knowledgeMap;
    const { entries } = qMatrix;

    // Aplicar todas las reglas
    const explorationTasks = applyExplorationRule(concepts);
    const masteryTasks = applyMasteryRule(concepts, entries);
    const shadowTasks = applyShadowRule(misconceptions, entries);
    const depthTasks = applyDepthRule(concepts, entries);

    // Combinar todas las tareas
    const allTasks = [
        ...explorationTasks,
        ...shadowTasks,      // Prioridad: crítica/alta
        ...masteryTasks,     // Prioridad: media
        ...depthTasks,       // Prioridad: baja
    ];

    // Ordenar por prioridad (crítico > alto > medio > bajo)
    const priorityOrder: Record<TaskPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };

    allTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return allTasks;
}

// ============================================================================
// HELPER FUNCTIONS - Análisis del estado
// ============================================================================

/**
 * Verifica si el diagnóstico está completo (no hay tareas pendientes)
 */
export function isDiagnosticComplete(state: DiagnosticSessionState): boolean {
    const pendingTasks = calculateCoverage(state);
    return pendingTasks.length === 0;
}

/**
 * Obtiene la tarea de mayor prioridad
 */
export function getNextTask(state: DiagnosticSessionState): PendingTask | null {
    const tasks = calculateCoverage(state);
    return tasks.length > 0 ? tasks[0] : null;
}

/**
 * Calcula el porcentaje de cobertura del diagnóstico
 */
export function calculateCoveragePercentage(state: DiagnosticSessionState): number {
    const { knowledgeMap, qMatrix } = state;
    const { concepts, misconceptions } = knowledgeMap;
    const { entries } = qMatrix;

    if (concepts.length === 0 && misconceptions.length === 0) {
        return 0;
    }

    // Total de ítems que deberíamos tener
    const expectedItems =
        concepts.length + // 1 reactivo de maestría por concepto
        misconceptions.length + // 1 reactivo CBM por error
        concepts.filter((c) => c.dependencies.length > 3).length; // 1 ranking por concepto complejo

    // Ítems que ya tenemos
    const actualItems = entries.filter((e) => e.probeId !== undefined).length;

    return expectedItems > 0 ? Math.round((actualItems / expectedItems) * 100) : 0;
}

/**
 * Genera un reporte de cobertura legible para humanos
 */
export function generateCoverageReport(state: DiagnosticSessionState): string {
    const tasks = calculateCoverage(state);
    const percentage = calculateCoveragePercentage(state);

    if (tasks.length === 0) {
        return `✅ Diagnóstico completo (100% de cobertura)`;
    }

    const criticalTasks = tasks.filter((t) => t.priority === 'critical').length;
    const highTasks = tasks.filter((t) => t.priority === 'high').length;
    const mediumTasks = tasks.filter((t) => t.priority === 'medium').length;
    const lowTasks = tasks.filter((t) => t.priority === 'low').length;

    let report = `📊 Cobertura del diagnóstico: ${percentage}%\n\n`;
    report += `Tareas pendientes: ${tasks.length}\n`;

    if (criticalTasks > 0) report += `  🔴 Críticas: ${criticalTasks}\n`;
    if (highTasks > 0) report += `  🟠 Altas: ${highTasks}\n`;
    if (mediumTasks > 0) report += `  🟡 Medias: ${mediumTasks}\n`;
    if (lowTasks > 0) report += `  🟢 Bajas: ${lowTasks}\n`;

    return report;
}
