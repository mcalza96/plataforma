/**
 * Session Evaluator - Orquestador DINA-lite
 * 
 * Punto de entrada para la evaluación de intentos. Pre-procesa telemetría
 * y delega en el analizador metacognitivo y el evaluador de competencias.
 */

import {
    StudentResponse,
    QMatrixMapping,
    DiagnosticResult,
    CompetencyDiagnosis,
} from '../assessment';
import { calculateBehaviorProfile, isEvidenceQualitySufficient, calculateRTE } from './behavior-detector';
import { calculateCalibration } from './metacognitive-analyzer';
import { processResponseEvidence } from './competency-evaluator';

/**
 * Evalúa una sesión completa de respuestas.
 */
export function evaluateSession(
    attemptId: string,
    studentId: string,
    rawResponses: StudentResponse[],
    qMatrix: QMatrixMapping[],
    cohortStats?: Map<string, { mean: number; stdDev: number }>
): DiagnosticResult {
    const diagnosesMap = new Map<string, CompetencyDiagnosis>();

    // 0. Pre-processing: Calculate Relative Metrics (RTE, Z-Score)
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

    // 2. Iterar sobre cada respuesta para acumular evidencia
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

    const competencyDiagnoses = Array.from(diagnosesMap.values());

    // Calcular score global
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
