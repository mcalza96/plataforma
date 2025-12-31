/**
 * Tests Unitarios para el Motor de Inferencia (El Juez)
 * 
 * Valida que el sistema distinga correctamente entre Gap, Bug y Mastery
 * bajo diferentes perfiles de comportamiento y telemetría.
 */

import { describe, it, expect } from 'vitest';
import { evaluateSession } from '../../../lib/domain/evaluation/inference-engine';
import { QMatrixMapping, StudentResponse } from '../../../lib/domain/evaluation/types';

describe('Inference Engine - Escenarios Clínicos', () => {

    // Matriz Q de prueba
    const mockQMatrix: QMatrixMapping[] = [
        {
            questionId: 'q1',
            competencyId: 'comp-suma',
            isTrap: true,
            trapOptionId: 'opt-err-lineal', // Error de suma lineal: 1/2 + 1/2 = 2/4
            idDontKnowOptionId: 'opt-dont-know',
        },
        {
            questionId: 'q2',
            competencyId: 'comp-suma',
            isTrap: false,
        }
    ];

    // ============================================================================
    // ESCENARIO 1: "El Confiado Equivocado" -> MISCONCEPTION
    // ============================================================================

    it('Debe diagnosticar MISCONCEPTION si elige trampa con confianza HIGH', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q1',
                selectedOptionId: 'opt-err-lineal',
                isCorrect: false,
                confidence: 'HIGH',
                telemetry: {
                    timeMs: 15000,
                    hesitationCount: 0,
                    hoverTimeMs: 500,
                },
            }
        ];

        const result = evaluateSession('att-1', 'stu-1', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('MISCONCEPTION');
        expect(diagnosis?.evidence.reason).toContain('error conceptual');
        expect(diagnosis?.evidence.confidenceScore).toBe(0.9);
    });

    // ============================================================================
    // ESCENARIO 2: "El Adivinador" (Rapid Guessing) -> UNKNOWN
    // ============================================================================

    it('Debe invalidar evidencia si el tiempo es menor al umbral (Rapid Guessing)', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q2',
                selectedOptionId: 'opt-correct',
                isCorrect: true,
                confidence: 'HIGH',
                telemetry: {
                    timeMs: 500, // Demasiado rápido (0.5s)
                    hesitationCount: 0,
                    hoverTimeMs: 0,
                },
            }
        ];

        const result = evaluateSession('att-2', 'stu-2', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('UNKNOWN');
        expect(diagnosis?.evidence.reason).toContain('impulsividad');
        expect(result.behaviorProfile.isImpulsive).toBe(true);
    });

    // ============================================================================
    // ESCENARIO 3: "El Honesto" -> GAP
    // ============================================================================

    it('Debe diagnosticar GAP si el estudiante admite no saber', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q1',
                selectedOptionId: 'opt-dont-know',
                isCorrect: false,
                confidence: 'NONE',
                telemetry: {
                    timeMs: 5000,
                    hesitationCount: 0,
                    hoverTimeMs: 100,
                },
            }
        ];

        const result = evaluateSession('att-3', 'stu-3', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('GAP');
        expect(diagnosis?.evidence.reason).toContain('No lo sé');
    });

    // ============================================================================
    // ESCENARIO 4: "El Frágil" (Hesitation) -> MASTERED pero con Alerta
    // ============================================================================

    it('Debe marcar MASTERED pero detectar ansiedad/duda si hubo hesitation', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q2',
                selectedOptionId: 'opt-correct',
                isCorrect: true,
                confidence: 'MEDIUM',
                telemetry: {
                    timeMs: 25000,
                    hesitationCount: 3, // Mucha duda
                    hoverTimeMs: 2000,   // Mucho hover
                },
            }
        ];

        const result = evaluateSession('att-4', 'stu-4', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('MASTERED');
        expect(result.behaviorProfile.isAnxious).toBe(true);
    });

    // ============================================================================
    // ESCENARIO 5: Precedencia Diagnóstica (Bug > Gap)
    // ============================================================================

    it('Debe dar prioridad a MISCONCEPTION sobre GAP si ambos están presentes', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q2',
                selectedOptionId: 'opt-incorrect',
                isCorrect: false,
                confidence: 'MEDIUM', // Esto daría un GAP
                telemetry: { timeMs: 10000, hesitationCount: 0, hoverTimeMs: 0 },
            },
            {
                questionId: 'q1',
                selectedOptionId: 'opt-err-lineal',
                isCorrect: false,
                confidence: 'HIGH', // Esto da un MISCONCEPTION (más fuerte)
                telemetry: { timeMs: 15000, hesitationCount: 0, hoverTimeMs: 0 },
            }
        ];

        const result = evaluateSession('att-5', 'stu-5', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('MISCONCEPTION');
        expect(diagnosis?.evidence.sourceQuestionIds).toHaveLength(2);
    });

    // ============================================================================
    // ESCENARIO 6: Adivinación (Baja confianza + Acierto) -> GAP
    // ============================================================================

    it('Debe diagnosticar GAP si acierta con confianza LOW (Lucky guess)', () => {
        const responses: StudentResponse[] = [
            {
                questionId: 'q2',
                selectedOptionId: 'opt-correct',
                isCorrect: true,
                confidence: 'LOW', // Aunque acertó, no está seguro
                telemetry: {
                    timeMs: 10000,
                    hesitationCount: 1,
                    hoverTimeMs: 500,
                },
            }
        ];

        const result = evaluateSession('att-6', 'stu-6', responses, mockQMatrix);
        const diagnosis = result.competencyDiagnoses.find(d => d.competencyId === 'comp-suma');

        expect(diagnosis?.state).toBe('GAP');
        expect(diagnosis?.evidence.reason).toContain('adivinación');
    });

});
