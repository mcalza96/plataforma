/**
 * Feedback Generator - Natural Language Generation (NLG) Simple
 * 
 * Este servicio transforma los resultados del Motor de Inferencia en un
 * reporte narrativo empático y accionable para el estudiante.
 */

import {
    DiagnosticResult,
    CompetencyDiagnosis,
    CompetencyEvaluationState
} from '../../domain/evaluation/types';

export interface FeedbackNarrative {
    title: string;
    message: string;
    tone: 'info' | 'success' | 'warning' | 'critical';
}

export interface FeedbackReport {
    executiveSummary: string;
    behavioralNote?: string;
    competencyNarratives: Record<string, FeedbackNarrative>;
    nextStepsHeadline: string;
}

/**
 * Genera el reporte narrativo basado en el resultado del diagnóstico.
 */
export function generateNarrative(result: DiagnosticResult): FeedbackReport {
    const { overallScore, behaviorProfile, competencyDiagnoses } = result;

    // 1. Resumen Ejecutivo
    let executiveSummary = '';
    if (overallScore >= 85) {
        executiveSummary = '¡Excelente desempeño! Demuestras una base sólida en la mayoría de los conceptos evaluados.';
    } else if (overallScore >= 60) {
        executiveSummary = 'Buen progreso. Tienes claridad en varios puntos, pero hemos identificado áreas específicas que necesitan refuerzo.';
    } else {
        executiveSummary = 'Este diagnóstico nos muestra que hay fundamentos clave que aún no están claros. Es el momento perfecto para nivelar.';
    }

    // 2. Nota Conductual (Telemetría)
    let behavioralNote: string | undefined;
    if (behaviorProfile.isImpulsive) {
        behavioralNote = 'Notamos que respondes muy rápido. Para los próximos temas, te recomendamos tomarte un momento para leer cada opción en voz alta.';
    } else if (behaviorProfile.isAnxious) {
        behavioralNote = 'Vimos que dudaste en algunas respuestas. Esto es normal cuando estamos aprendiendo; la práctica te dará la seguridad que falta.';
    }

    // 3. Narrativas por Competencia
    const competencyNarratives: Record<string, FeedbackNarrative> = {};

    for (const diagnosis of competencyDiagnoses) {
        competencyNarratives[diagnosis.competencyId] = generateCompetencyNarrative(diagnosis);
    }

    // 4. Titular de Siguientes Pasos
    const criticalBugs = competencyDiagnoses.filter(d => d.state === 'MISCONCEPTION').length;
    const nextStepsHeadline = criticalBugs > 0
        ? `Tienes ${criticalBugs} puntos críticos que requieren atención inmediata.`
        : '¡Listo para tu plan de nivelación personalizado!';

    return {
        executiveSummary,
        behavioralNote,
        competencyNarratives,
        nextStepsHeadline
    };
}

/**
 * Genera la narrativa específica para una sola competencia
 */
function generateCompetencyNarrative(diagnosis: CompetencyDiagnosis): FeedbackNarrative {
    const { state, evidence } = diagnosis;

    switch (state) {
        case 'MISCONCEPTION':
            return {
                title: 'Conflicto Cognitivo Detectado',
                message: `Parece que hay una confusión específica: ${evidence.reason}. Necesitas ver la refutación visual para ajustar este concepto.`,
                tone: 'critical'
            };

        case 'GAP':
            return {
                title: 'Nuevos Fundamentos',
                message: 'Aún no hemos detectado una base sólida aquí. Empezaremos desde cero con andamiaje progresivo.',
                tone: 'warning'
            };

        case 'MASTERED':
            return {
                title: 'Concepto Dominado',
                message: 'Manejas este tema con solidez y seguridad. ¡Sigue así!',
                tone: 'success'
            };

        case 'UNKNOWN':
        default:
            return {
                title: 'Evidencia Insuficiente',
                message: 'No logramos capturar suficiente información clara. Volveremos a evaluar este punto más adelante.',
                tone: 'info'
            };
    }
}
