/**
 * Pedagogical Advisor Service - Traductor de Métricas a Sugerencias Proactivas
 * 
 * Este servicio encapsula la lógica para convertir datos técnicos de calibración
 * y telemetría en alertas informativas y procesables para el maestro.
 */

export interface PedagogicalAlert {
    id: string;
    type: 'COGNITIVE_BIAS' | 'VISUAL_FATIGUE' | 'SMART_PRUNING';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    title: string;
    message: string;
    suggestion: string;
    metadata: Record<string, unknown>;
}

export class PedagogicalAdvisorService {
    /**
     * Analiza el estado de la cohorte y genera alertas de sesgo cognitivo (ECE).
     * @param delusionalPercentage Porcentaje de alumnos en el cuadrante "Delirante"
     */
    static getMetacognitiveAlert(delusionalPercentage: number): PedagogicalAlert | null {
        if (delusionalPercentage > 0.20) {
            return {
                id: `ece-${Date.now()}`,
                type: 'COGNITIVE_BIAS',
                severity: 'HIGH',
                title: 'Alerta de Sesgo Cognitivo',
                message: `El ${Math.round(delusionalPercentage * 100)}% de la clase muestra exceso de confianza en temas no dominados (Cuadrante Delirante).`,
                suggestion: 'Se sugiere una Sesión de Refutación Inmediata de conceptos erróneos.',
                metadata: { delusionalPercentage }
            };
        }
        return null;
    }

    /**
     * Traduce alertas de integridad de ítems a sugerencias pedagógicas de evolución.
     */
    static translateIntegrityAlert(alert: {
        id: string;
        alert_type: string;
        message: string;
        question_id?: string;
        metadata?: Record<string, unknown>;
    }): PedagogicalAlert {
        const isUselessDistractor = alert.alert_type === 'USELESS_DISTRACTOR';

        return {
            id: alert.id,
            type: isUselessDistractor ? 'SMART_PRUNING' : 'COGNITIVE_BIAS',
            severity: isUselessDistractor ? 'LOW' : 'MEDIUM',
            title: isUselessDistractor ? 'Sugerencia de Evolución' : 'Anomalía de Ítem',
            message: alert.message,
            suggestion: isUselessDistractor
                ? '¿Deseas podar este distractor o reemplazarlo por un nuevo Nodo Sombra?'
                : 'Considera revisar la redacción de este ítem.',
            metadata: {
                questionId: alert.question_id,
                optionId: alert.metadata?.option_id
            }
        };
    }

    /**
     * Identifica ítems que están causando fatiga visual o dudas tóxicas basándose en el RTE.
     */
    static getFatigueAlert(itemStats: {
        questionId: string;
        rte: number;
        accuracy: number;
    }): PedagogicalAlert | null {
        if (itemStats.rte > 2.5) {
            return {
                id: `rte-${itemStats.questionId}`,
                type: 'VISUAL_FATIGUE',
                severity: 'MEDIUM',
                title: 'Fricción de Lectura Detectada',
                message: `Este ítem presenta un RTE de ${itemStats.rte.toFixed(1)}x, indicando una carga cognitiva excesiva.`,
                suggestion: 'Considera simplificar la redacción o fragmentar el enunciado.',
                metadata: { questionId: itemStats.questionId, rte: itemStats.rte }
            };
        }
        return null;
    }
}
