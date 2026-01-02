/**
 * Competency Evaluator - Diagnóstico Diferencial de Evidencia
 * 
 * Implementa las reglas de negocio para determinar el estado de una competencia
 * basándose en respuestas, telemetría y estado de calibración.
 */

import {
    StudentResponse,
    QMatrixMapping,
    CompetencyDiagnosis,
    CompetencyEvaluationState,
    EVALUATION_PRIORITY,
} from '../assessment';
import { isEvidenceQualitySufficient } from './behavior-detector';

/**
 * Procesa una respuesta individual y actualiza/crea el diagnóstico de una competencia.
 * 
 * Sigue la regla de que el MISCONCEPTION tiene prioridad clínica sobre el GAP,
 * y el MASTERED requiere evidencia sólida (CBM).
 */
export function processResponseEvidence(
    response: StudentResponse,
    mapping: QMatrixMapping,
    calibrationStatus: 'CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT',
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

        // PENALIZACIÓN METACOGNITIVA: Si es crónicamente OVERCONFIDENT, penalizamos la calidad de la evidencia
        confidenceScore = calibrationStatus === 'OVERCONFIDENT' ? 0.95 : 0.9;
        if (calibrationStatus === 'OVERCONFIDENT') {
            reason += " (Reforzado por Desviación Metacognitiva: Punto Ciego Cognitivo)";
        }
    }
    // Caso C: MASTERY - Correcto con seguridad aceptable
    else if (response.isCorrect && (response.confidence === 'HIGH' || response.confidence === 'MEDIUM')) {
        // DETECCIÓN DE DUDA TÓXICA / LUCHA IMPRODUCTIVA (Z-Score > 2.0)
        if (response.telemetry.zScore && response.telemetry.zScore > 2.0) {
            state = 'GAP';
            reason = 'Acierto con costo cognitivo excesivo (Duda Tóxica: Z > 2.0). Requiere fluidez.';
            confidenceScore = 0.6;
        } else {
            state = 'MASTERED';
            reason = 'Respuesta correcta con nivel de seguridad consistente';
            confidenceScore = 0.85;
        }
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
        remedialContentIds: [],
    };
}
