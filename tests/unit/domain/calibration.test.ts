import { describe, it, expect } from 'vitest';
import { evaluateSession } from '../../../lib/domain/evaluation/inference-engine';
import { StudentResponse, QMatrixMapping } from '../../../lib/domain/evaluation/types';

describe('Inference Engine - Metacognitive Calibration (ECE)', () => {

    const mockQMatrix: QMatrixMapping[] = [
        { questionId: 'q1', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q2', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q3', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q4', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q5', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q6', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q7', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q8', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q9', competencyId: 'comp-1', isTrap: false },
        { questionId: 'q10', competencyId: 'comp-1', isTrap: false },
    ];

    // ============================================================================
    // ESCENARIO 1: "Estudiante Temerario" (Dunning-Kruger) -> OVERCONFIDENT
    // ============================================================================

    it('Debe diagnosticar OVERCONFIDENT si hay alta confianza pero bajos aciertos', () => {
        // 10 respuestas con confianza HIGH (100)
        // Solo 2 correctas (20% accuracy)
        const responses: StudentResponse[] = Array.from({ length: 10 }, (_, i) => ({
            questionId: `q${i + 1}`,
            selectedOptionId: 'opt-x',
            isCorrect: i < 2, // 2 correctas
            confidence: 'HIGH',
            telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 }
        }));

        const result = evaluateSession('att-1', 'stu-1', responses, mockQMatrix);

        expect(result.calibration.calibrationStatus).toBe('OVERCONFIDENT');
        expect(result.calibration.certaintyAverage).toBe(100);
        expect(result.calibration.accuracyAverage).toBe(20);
        // ECE = |100 - 20| = 80
        expect(result.calibration.eceScore).toBe(80);
    });

    // ============================================================================
    // ESCENARIO 2: "El Impostor" -> UNDERCONFIDENT
    // ============================================================================

    it('Debe diagnosticar UNDERCONFIDENT si hay baja confianza pero altos aciertos', () => {
        // 10 respuestas con confianza LOW (33)
        // 9 correctas (90% accuracy)
        const responses: StudentResponse[] = Array.from({ length: 10 }, (_, i) => ({
            questionId: `q${i + 1}`,
            selectedOptionId: 'opt-x',
            isCorrect: i < 9, // 9 correctas
            confidence: 'LOW',
            telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 }
        }));

        const result = evaluateSession('att-2', 'stu-2', responses, mockQMatrix);

        expect(result.calibration.calibrationStatus).toBe('UNDERCONFIDENT');
        expect(result.calibration.certaintyAverage).toBe(33);
        expect(result.calibration.accuracyAverage).toBe(90);
        // ECE = |33 - 90| = 57
        expect(result.calibration.eceScore).toBe(57);
    });

    // ============================================================================
    // ESCENARIO 3: "Estudiante Calibrado" -> CALIBRATED
    // ============================================================================

    it('Debe diagnosticar CALIBRATED si la confianza coincide con el acierto', () => {
        // 10 respuestas con confianza MEDIUM (66)
        // 7 correctas (70% accuracy) -> Diferencia de 4% (dentro del umbral de 15%)
        const responses: StudentResponse[] = Array.from({ length: 10 }, (_, i) => ({
            questionId: `q${i + 1}`,
            selectedOptionId: 'opt-x',
            isCorrect: i < 7,
            confidence: 'MEDIUM',
            telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 }
        }));

        const result = evaluateSession('att-3', 'stu-3', responses, mockQMatrix);

        expect(result.calibration.calibrationStatus).toBe('CALIBRATED');
        expect(result.calibration.eceScore).toBe(Math.round(Math.abs(66 - 70)));
    });

    // ============================================================================
    // ESCENARIO 4: Bins Heterogéneos (ECE Ponderado)
    // ============================================================================

    it('Debe calcular el ECE ponderado correctamente con múltiples bins', () => {
        // 5 HIGH (100) -> 5 correctas (100% acc). Error = 0.
        // 5 NONE (0) -> 0 correctas (0% acc). Error = 0.
        // ECE global should be 0.
        const responses: StudentResponse[] = [
            ...Array.from({ length: 5 }, (_, i) => ({
                questionId: `q${i + 1}`,
                selectedOptionId: 'opt-x',
                isCorrect: true,
                confidence: 'HIGH' as const,
                telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 }
            })),
            ...Array.from({ length: 5 }, (_, i) => ({
                questionId: `q${i + 6}`,
                selectedOptionId: 'opt-x',
                isCorrect: false,
                confidence: 'NONE' as const,
                telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 }
            }))
        ];

        const result = evaluateSession('att-4', 'stu-4', responses, mockQMatrix);

        expect(result.calibration.eceScore).toBe(0);
        expect(result.calibration.calibrationStatus).toBe('CALIBRATED');
    });

});
