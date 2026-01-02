/**
 * Agent Guidance - Métodos para guiar al Agente IA durante la sesión de diagnóstico.
 */

import { DiagnosticSessionState } from './types';
import { getNextTask, generateCoverageReport } from './coverage-engine';

/**
 * Obtiene la siguiente instrucción para el Agente IA
 */
export function getNextObjective(session: DiagnosticSessionState): string {
    const nextTask = getNextTask(session);

    if (!nextTask) {
        return `✅ El diagnóstico está completo. Procede a sintetizar los hallazgos y generar el reporte final.`;
    }

    switch (nextTask.type) {
        case 'EXPLORE_CONCEPTS':
            return `🔍 OBJETIVO PRIORITARIO: Exploración de Conceptos
\nTu siguiente objetivo es identificar más conceptos fundamentales del área "${session.subjectArea}".
\nRazón: ${nextTask.reason}
\nEstrategia sugerida:
1. Pregunta al estudiante sobre temas generales del área
2. Identifica conceptos clave mencionados
3. Registra cada concepto usando registerConcept()
4. Pregunta por relaciones/dependencias entre conceptos
\nEjemplo de pregunta: "¿Qué temas de ${session.subjectArea} has estudiado recientemente?"`;

        case 'GENERATE_MASTERY':
            const concept = session.knowledgeMap.concepts.find(
                (c) => c.id === nextTask.targetId
            );
            return `✅ OBJETIVO PRIORITARIO: Verificar Maestría
\nTu siguiente objetivo es diseñar un reactivo positivo (MASTERY) para el concepto "${concept?.label}".
\nRazón: ${nextTask.reason}
\nEstrategia sugerida:
1. Diseña una pregunta que evalúe comprensión genuina del concepto
2. Incluye opciones que requieran aplicación, no solo memorización
3. Registra el reactivo usando registerProbe()
4. Administra la pregunta al estudiante
\nDescripción del concepto: ${concept?.description || 'No disponible'}`;

        case 'GENERATE_TRAP':
            const misconception = session.knowledgeMap.misconceptions.find(
                (m) => m.id === nextTask.targetId
            );
            return `🎯 OBJETIVO CRÍTICO: Diseñar Trampa (CBM)
\nTu siguiente objetivo es diseñar un reactivo CBM (Certainty-Based Marking) para validar el error "${misconception?.label}".
\nRazón: ${nextTask.reason}
\nEstrategia sugerida:
1. Diseña una pregunta donde la respuesta INCORRECTA parezca correcta si el estudiante tiene este error
2. Incluye un distractor que refleje exactamente el misconception
3. Usa CBM: pide al estudiante que indique su nivel de certeza (0-100%)
4. Registra el reactivo usando registerProbe()
5. Si el estudiante cae en la trampa con alta certeza, marca el error como validado
\nDescripción del error: ${misconception?.description || 'No disponible'}
Severidad: ${misconception?.severity}`;

        case 'GENERATE_RANKING':
            const complexConcept = session.knowledgeMap.concepts.find(
                (c) => c.id === nextTask.targetId
            );
            return `📊 OBJETIVO: Evaluar Profundidad (Ranking)
\nTu siguiente objetivo es diseñar un reactivo de RANKING para el concepto "${complexConcept?.label}".
\nRazón: ${nextTask.reason}
\nEstrategia sugerida:
1. Presenta una lista de conceptos relacionados (incluyendo las dependencias)
2. Pide al estudiante que los ordene por complejidad, prerequisitos, o secuencia lógica
3. Registra el reactivo usando registerProbe()
4. Evalúa si el estudiante comprende las relaciones jerárquicas
\nDependencias del concepto: ${complexConcept?.dependencies.join(', ')}`;

        case 'VALIDATE_MISCONCEPTION':
            const misconceptionToValidate = session.knowledgeMap.misconceptions.find(
                (m) => m.id === nextTask.targetId
            );
            return `🔬 OBJETIVO: Validar Error Detectado
\nTu siguiente objetivo es obtener evidencia adicional del error "${misconceptionToValidate?.label}".
\nRazón: ${nextTask.reason}
\nEstrategia sugerida:
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
\nEstudiante: ${session.studentId}
Área: ${session.subjectArea}
Estado: ${session.status}
\n${coverageReport}
\nMapa de Conocimiento:
  - Conceptos identificados: ${knowledgeMap.concepts.length}
  - Errores detectados: ${knowledgeMap.misconceptions.length}
  - Reactivos generados: ${session.qMatrix.entries.length}
  - Turnos de conversación: ${conversationHistory.length}
\nÚltima actualización: ${session.lastUpdated.toISOString()}
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
