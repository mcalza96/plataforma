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

const RAPID_GUESSING_THRESHOLD_MS = 2000; // Menos de 2 segundos es adivinación
const HESITATION_THRESHOLD_CHANGES = 2;   // Más de 2 cambios es duda significativa
const HOVER_TIME_THRESHOLD_MS = 1500;     // Mucho tiempo de hover indica duda o reflexión profunda

// ============================================================================
// DETECTORES
// ============================================================================

/**
 * Detecta si una respuesta fue emitida demasiado rápido.
 * 
 * Se basa en el tiempo total que el estudiante pasó en la pregunta.
 * Si es menor al umbral, se considera falta de compromiso (invalidando diagnóstico conceptual).
 */
export function isRapidGuessing(timeMs: number): boolean {
    return timeMs < RAPID_GUESSING_THRESHOLD_MS;
}

/**
 * Detecta si hubo duda significativa (Hesitation).
 * 
 * Se basa en la cantidad de cambios de opción y el tiempo de hover sobre la opción final.
 */
export function hasHesitation(telemetry: {
    hesitationCount: number;
    hoverTimeMs: number;
}): boolean {
    return (
        telemetry.hesitationCount >= HESITATION_THRESHOLD_CHANGES ||
        telemetry.hoverTimeMs >= HOVER_TIME_THRESHOLD_MS
    );
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

    const impulsiveCount = responses.filter((r) => isRapidGuessing(r.telemetry.timeMs)).length;
    const anxiousCount = responses.filter((r) =>
        hasHesitation({
            hesitationCount: r.telemetry.hesitationCount,
            hoverTimeMs: r.telemetry.hoverTimeMs,
        })
    ).length;

    // Consistencia: ¿Sus aciertos coinciden con su confianza?
    // Se considera inconsistente si tiene alta confianza y falla, o baja confianza y acierta (adivinó)
    const inconsistentCount = responses.filter((r) => {
        const isHighConfidenceError = r.confidence === 'HIGH' && !r.isCorrect;
        const isLowConfidenceSuccess = r.confidence === 'LOW' && r.isCorrect;
        return isHighConfidenceError || isLowConfidenceSuccess;
    }).length;

    return {
        isImpulsive: impulsiveCount > responses.length * 0.3, // Más del 30% son rápidas
        isAnxious: anxiousCount > responses.length * 0.4,     // Más del 40% tienen duda
        isConsistent: inconsistentCount < responses.length * 0.2, // Menos del 20% son inconsistentes
    };
}

/**
 * Determina si una evidencia es "Válida" para diagnóstico conceptual.
 * 
 * Una respuesta NO es válida si es Rapid Guessing (adivinación mecánica).
 */
export function isEvidenceQualitySufficient(response: StudentResponse): boolean {
    return !isRapidGuessing(response.telemetry.timeMs);
}
