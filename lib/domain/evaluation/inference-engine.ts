/**
 * Inference Engine - DINA-lite Algorithm
 * 
 * Este módulo actúa como "El Juez". Procesa respuestas y telemetría
 * para emitir diagnósticos sobre el conocimiento del estudiante.
 */

import {
    StudentResponse,
    QMatrixMapping,
    DiagnosticResult,
    CompetencyDiagnosis,
    CompetencyEvaluationState,
    EVALUATION_PRIORITY,
} from './types';
import { calculateBehaviorProfile, isEvidenceQualitySufficient } from './behavior-detector';

// ============================================================================
// CORE INFERENCE - El Algoritmo Juez
// ============================================================================

/**
 * Evalúa una sesión completa de respuestas.
 */
export function evaluateSession(
    attemptId: string,
    studentId: string,
    responses: StudentResponse[],
    qMatrix: QMatrixMapping[]
): DiagnosticResult {
    const diagnosesMap = new Map<string, CompetencyDiagnosis>();

    // Iterar sobre cada respuesta para acumular evidencia
    for (const response of responses) {
        const mapping = qMatrix.find((m) => m.questionId === response.questionId);
        if (!mapping) continue;

        const currentDiagnosis = diagnosesMap.get(mapping.competencyId);
        const newDiagnosis = processResponseEvidence(response, mapping, currentDiagnosis);

        if (newDiagnosis) {
            diagnosesMap.set(mapping.competencyId, newDiagnosis);
        }
    }

    // Convertir el Mapa a Array
    const competencyDiagnoses = Array.from(diagnosesMap.values());

    // Calcular score global (solo de respuestas válidas)
    const validResponses = responses.filter(isEvidenceQualitySufficient);
    const correctCount = validResponses.filter((r) => r.isCorrect).length;
    const overallScore = validResponses.length > 0
        ? Math.round((correctCount / validResponses.length) * 100)
        : 0;

    return {
        attemptId,
        studentId,
        overallScore,
        behaviorProfile: calculateBehaviorProfile(responses),
        competencyDiagnoses,
        timestamp: new Date(),
    };
}

/**
 * Procesa una respuesta individual y actualiza/crea el diagnóstico de una competencia.
 * 
 * Sigue la regla de que el MISCONCEPTION tiene prioridad clínica sobre el GAP,
 * y el MASTERED requiere evidencia sólida (CBM).
 */
function processResponseEvidence(
    response: StudentResponse,
    mapping: QMatrixMapping,
    existingDiagnosis?: CompetencyDiagnosis
): CompetencyDiagnosis {
    let state: CompetencyEvaluationState = 'UNKNOWN';
    let reason = '';
    let confidenceScore = 0;

    // 1. FILTRO: Calidad de Evidencia
    if (!isEvidenceQualitySufficient(response)) {
        return existingDiagnosis || {
            competencyId: mapping.competencyId,
            state: 'UNKNOWN',
            evidence: {
                reason: 'Evidencia descartada por respuesta demasiado rápida (impulsividad)',
                confidenceScore: 0,
                sourceQuestionIds: [response.questionId]
            },
            remedialContentIds: [],
        };
    }

    // 2. LÓGICA DE DIAGNÓSTICO DIFERENCIAL

    // Caso A: El estudiante admite que no sabe
    if (response.selectedOptionId === mapping.idDontKnowOptionId) {
        state = 'GAP';
        reason = 'El estudiante seleccionó explícitamente "No lo sé"';
        confidenceScore = 1.0;
    }
    // Caso B: BUG (Misconception) - Atrapado en trampa con alta seguridad
    else if (
        mapping.isTrap &&
        response.selectedOptionId === mapping.trapOptionId &&
        response.confidence === 'HIGH'
    ) {
        state = 'MISCONCEPTION';
        reason = `Evidencia de error conceptual: seleccionó opción trampa para "${mapping.misconceptionId}" con alta seguridad`;
        confidenceScore = 0.9;
    }
    // Caso C: MASTERY - Correcto con seguridad aceptable
    else if (response.isCorrect && (response.confidence === 'HIGH' || response.confidence === 'MEDIUM')) {
        state = 'MASTERED';
        reason = 'Respuesta correcta con nivel de seguridad consistente';
        confidenceScore = 0.85;
    }
    // Caso D: GAP - Incorrecto o Correcto por azar (Baja seguridad)
    else if (!response.isCorrect || response.confidence === 'LOW') {
        state = 'GAP';
        reason = !response.isCorrect
            ? 'Respuesta incorrecta (posible falta de conocimiento base)'
            : 'Respuesta correcta pero con baja seguridad (posible adivinación)';
        confidenceScore = 0.7;
    }

    // 3. REGLA DE SOBRESCRITURA (Precedencia Diagnóstica)
    if (existingDiagnosis) {
        const existingPriority = EVALUATION_PRIORITY[existingDiagnosis.state];
        const newPriority = EVALUATION_PRIORITY[state];

        // Si la nueva evidencia es más "fuerte" diagnósticamente, sobrescribimos
        if (newPriority >= existingPriority) {
            return {
                ...existingDiagnosis,
                state,
                evidence: {
                    reason,
                    confidenceScore,
                    sourceQuestionIds: [...existingDiagnosis.evidence.sourceQuestionIds, response.questionId],
                },
            };
        }

        // Si no es más fuerte, mantenemos el estado pero agregamos la pregunta como fuente
        return {
            ...existingDiagnosis,
            evidence: {
                ...existingDiagnosis.evidence,
                sourceQuestionIds: [...existingDiagnosis.evidence.sourceQuestionIds, response.questionId],
            }
        };
    }

    // 4. CREACIÓN DE NUEVO DIAGNÓSTICO
    return {
        competencyId: mapping.competencyId,
        state,
        evidence: {
            reason,
            confidenceScore,
            sourceQuestionIds: [response.questionId],
        },
        remedialContentIds: [], // Se llenaría en la capa de aplicación con un ContentService
    };
}
