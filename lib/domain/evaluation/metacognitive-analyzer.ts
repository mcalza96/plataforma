/**
 * Metacognitive Analyzer - Cálculo de Calibración Estratégica
 * 
 * Implementa el algoritmo ECE (Expected Calibration Error) para determinar
 * la desviación entre confianza y precisión del estudiante.
 */

import { StudentResponse } from '../assessment';
import { isEvidenceQualitySufficient } from './behavior-detector';

export interface CalibrationResult {
    certaintyAverage: number;
    accuracyAverage: number;
    eceScore: number;
    calibrationStatus: 'CALIBRATED' | 'OVERCONFIDENT' | 'UNDERCONFIDENT';
    blindSpots: number;
    fragileKnowledge: number;
}

/**
 * Calcula la calibración avanzada usando Expected Calibration Error (ECE).
 * Agrupa respuestas en bins por nivel de confianza y calcula la desviación ponderada.
 */
export function calculateCalibration(responses: StudentResponse[]): CalibrationResult {
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
        const binConfidence = confidenceValueMap[binLevel];

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
