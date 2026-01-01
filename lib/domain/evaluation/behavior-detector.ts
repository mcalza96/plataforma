/**
 * Behavior Detector - Análisis de Telemetría
 * 
 * Este módulo contiene funciones puras para analizar los patrones
 * conductuales del estudiante durante la evaluación.
 */

import { ResponseTelemetry, BehaviorProfile, StudentResponse } from './types';

// ============================================================================
// CONFIGURACIÓN DE UMBRALES (Thresholds)
// ============================================================================

// ============================================================================
// CONFIGURACIÓN DE UMBRALES (Thresholds)
// ============================================================================

// ============================================================================
// CONFIGURACIÓN DE UMBRALES (Thresholds)
// ============================================================================

const RAPID_GUESSING_THRESHOLD_MS = 2000; // Legacy absolute fallback
const RAPID_GUESSING_RTE_THRESHOLD = 0.3; // NT10 Rule (30% of expected time)
const HESITATION_THRESHOLD_CHANGES = 2;
const HOVER_TIME_THRESHOLD_MS = 1500;

// Mobile / Latency Factors
const VOLATILITY_FACTOR = 0.5; // Multiplier for option changes
const REVISIT_PENALTY = 1.0;   // Penalty for every revisit

// ============================================================================
// DETECTORES
// ============================================================================

/**
 * Calculates Response Time Effort (RTE).
 * RTE = Observed Time / Expected Time
 * Returns undefined if expectedTime is missing (Legacy Mode).
 */
export function calculateRTE(timeMs: number, expectedTimeSeconds?: number): number | undefined {
    if (!expectedTimeSeconds || expectedTimeSeconds <= 0) return undefined;
    const observedSeconds = timeMs / 1000;
    return parseFloat((observedSeconds / expectedTimeSeconds).toFixed(2));
}

/**
 * Detecta si una respuesta fue emitida demasiado rápido.
 * 
 * Si se proporciona RTE, usa la regla NT10 (RTE < 0.3).
 * Si no, usa el umbral absoluto (Legacy < 2s).
 */
export function isRapidGuessing(timeMs: number, rte?: number): boolean {
    if (rte !== undefined) {
        return rte < RAPID_GUESSING_RTE_THRESHOLD;
    }
    return timeMs < RAPID_GUESSING_THRESHOLD_MS;
}

/**
 * Calculates Temporal Entropy (Hi) for Mobile Context.
 * Hi = (Changes * Volatility) + (Revisit Penalty)
 * 
 * Formula: Hi = (hesitationCount * 0.5) + (revisitCount * 1.0)
 */
export function calculateTemporalEntropy(
    hesitationCount: number,
    revisitCount: number
): number {
    return (hesitationCount * VOLATILITY_FACTOR) + (revisitCount * REVISIT_PENALTY);
}

/**
 * Detects 'Fragile Certainty': Correct answer but with high confirmation latency.
 * Triggered if latency Z-Score > 2.0 (Adjusted from 3.0 for mobile sensitivity).
 */
export function isFragileCertainty(
    isCorrect: boolean,
    zScore?: number
): boolean {
    if (!isCorrect || zScore === undefined) return false;
    return zScore > 2.0;
}

/**
 * Genera el perfil conductual agregado de una sesión
 */
export function calculateBehaviorProfile(
    responses: StudentResponse[]
): BehaviorProfile {
    if (responses.length === 0) {
        return {
            isImpulsive: false,
            isAnxious: false,
            isConsistent: true,
        };
    }

    // 1. Impulsiveness (Rapid Guessing)
    const impulsiveCount = responses.filter((r) =>
        isRapidGuessing(r.telemetry.timeMs, r.telemetry.rte)
    ).length;

    // 2. Anxiety / Toxic Doubt / Mental Conflict
    const anxiousCount = responses.filter((r) => {
        const Hi = calculateTemporalEntropy(r.telemetry.hesitationCount, r.telemetry.revisitCount || 0);

        // Threshold: Hi > 2 (e.g., 2 revisits OR 4 changes OR mix)
        // If Hi > 2, it indicates significant circular navigation or indecision.
        const isHighEntropy = Hi > 2.0;

        // Also check Fragile Certainty (High Z-Score even if correct)
        const isFragile = isFragileCertainty(r.isCorrect, r.telemetry.zScore);

        return isHighEntropy || isFragile;
    }).length;

    // 3. Consistency (Metacognitive Coherence)
    const inconsistentCount = responses.filter((r) => {
        const isHighConfidenceError = r.confidence === 'HIGH' && !r.isCorrect;
        const isLowConfidenceSuccess = r.confidence === 'LOW' && r.isCorrect;
        return isHighConfidenceError || isLowConfidenceSuccess;
    }).length;

    return {
        isImpulsive: impulsiveCount > responses.length * 0.3, // > 30% are rapid guesses
        isAnxious: anxiousCount > responses.length * 0.4,     // > 40% are anxious/doubtful
        isConsistent: inconsistentCount < responses.length * 0.2, // < 20% inconsistency allowed
    };
}

/**
 * Determina si una evidencia es "Válida" para diagnóstico conceptual.
 * 
 * Una respuesta NO es válida si es Rapid Guessing (adivinación mecánica).
 */
export function isEvidenceQualitySufficient(response: StudentResponse): boolean {
    return !isRapidGuessing(response.telemetry.timeMs, response.telemetry.rte);
}
