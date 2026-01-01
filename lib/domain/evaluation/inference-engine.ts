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
import { calculateBehaviorProfile, isEvidenceQualitySufficient, calculateRTE } from './behavior-detector';

// ============================================================================
// CORE INFERENCE - El Algoritmo Juez
// ============================================================================

/**
 * Evalúa una sesión completa de respuestas.
 */
/**
 * Evalúa una sesión completa de respuestas.
 */
export function evaluateSession(
    attemptId: string,
    studentId: string,
    rawResponses: StudentResponse[], // Input responses might lack RTE
    qMatrix: QMatrixMapping[],
    cohortStats?: Map<string, { mean: number; stdDev: number }> // Optional cohort data
): DiagnosticResult {
    const diagnosesMap = new Map<string, CompetencyDiagnosis>();

    // 0. Pre-processing: Calculate Relative Metrics (RTE, Z-Score)
    // calculateRTE is now imported statically

    const responses = rawResponses.map(r => {
        const rte = calculateRTE(r.telemetry.timeMs, r.telemetry.expectedTime);
        let zScore = 0;

        if (cohortStats && cohortStats.has(r.questionId)) {
            const stats = cohortStats.get(r.questionId)!;
            if (stats.stdDev > 0) {
                zScore = (r.telemetry.timeMs - stats.mean) / stats.stdDev;
            }
        }

        return {
            ...r,
            telemetry: {
                ...r.telemetry,
                rte,
                zScore
            }
        };
    });

    // 1. Calcular métricas de calibración primero (Espejo Metacognitivo)
    const calibration = calculateCalibration(responses);

    // 2. Iterar sobre cada respuesta para acumular evidencia, usando el estado de calibración
    for (const response of responses) {
        const mapping = qMatrix.find((m) => m.questionId === response.questionId);
        if (!mapping) continue;

        const currentDiagnosis = diagnosesMap.get(mapping.competencyId);
        const newDiagnosis = processResponseEvidence(
            response,
            mapping,
            calibration.calibrationStatus,
            currentDiagnosis
        );

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
        calibration,
        competencyDiagnoses,
        timestamp: new Date(),
    };
}

/**
 * Calcula la calibración entre confianza y acierto.
 */
/**
 * Calcula la calibración avanzada usando Expected Calibration Error (ECE).
 * Agrupa respuestas en bins por nivel de confianza y calcula la desviación ponderada.
 */
function calculateCalibration(responses: StudentResponse[]) {
    const valid = responses.filter(isEvidenceQualitySufficient);
    if (valid.length === 0) {
        return {
            certaintyAverage: 0,
            accuracyAverage: 0,
            eceScore: 0,
            calibrationStatus: 'CALIBRATED' as const,
            blindSpots: 0,
            fragileKnowledge: 0
        };
    }

    const confidenceValueMap: Record<string, number> = { 'HIGH': 100, 'MEDIUM': 66, 'LOW': 33, 'NONE': 0 };
    const bins = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];

    let totalWeightedError = 0;
    let totalCertainty = 0;
    let totalAccuracy = 0;

    // Calcular métricas por cada bin (cubeta de confianza)
    for (const binLevel of bins) {
        const binResponses = valid.filter(r => r.confidence === binLevel);
        if (binResponses.length === 0) continue;

        const binAccuracy = (binResponses.filter(r => r.isCorrect).length / binResponses.length) * 100;
        const binConfidence = confidenceValueMap[binLevel]; // En este caso es constante por bin

        // Error Absoluto del Bin
        const binError = Math.abs(binAccuracy - binConfidence);

        // El ECE es la suma ponderada del error de cada bin
        totalWeightedError += (binResponses.length / valid.length) * binError;

        totalCertainty += binConfidence * binResponses.length;
        totalAccuracy += binAccuracy * binResponses.length;
    }

    const avgCertainty = totalCertainty / valid.length;
    const avgAccuracy = totalAccuracy / valid.length;

    // Determinación del Estado Clínico
    let calibrationStatus: 'CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT' = 'CALIBRATED';
    if (avgCertainty > avgAccuracy + 15) {
        calibrationStatus = 'OVERCONFIDENT';
    } else if (avgAccuracy > avgCertainty + 15) {
        calibrationStatus = 'UNDERCONFIDENT';
    }

    // Blind Spots: High Confidence but Incorrect.
    // Critical: If RTE < 0.5 (Fast) and Incorrect + High Confidence -> Impulsive Delusion
    const blindSpots = valid.filter(r =>
        !r.isCorrect && r.confidence === 'HIGH'
    ).length;

    // Fragile Knowledge: Correct but Low Confidence OR Correct but Extreme Effort (Toxic Doubt)
    const fragileKnowledge = valid.filter(r =>
        (r.isCorrect && (r.confidence === 'LOW' || r.confidence === 'MEDIUM')) ||
        (r.isCorrect && r.telemetry.zScore && r.telemetry.zScore > 2.0)
    ).length;

    return {
        certaintyAverage: Math.round(avgCertainty),
        accuracyAverage: Math.round(avgAccuracy),
        eceScore: Math.round(totalWeightedError),
        calibrationStatus,
        blindSpots,
        fragileKnowledge
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
        // Si el estudiante acierta pero tardó 2 desviaciones estándar más que la media, no es maestría fluida.
        if (response.telemetry.zScore && response.telemetry.zScore > 2.0) {
            state = 'GAP'; // Se degrada a GAP (Fragile Knowledge) para forzar refuerzo
            reason = 'Acierto con costo cognitivo excesivo (Duda Tóxica: Z > 2.0). Requiere fluidez.';
            confidenceScore = 0.6; // Confianza baja por falta de automaticidad
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
