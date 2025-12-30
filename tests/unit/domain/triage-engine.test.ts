import { describe, it, expect } from 'vitest';
import { TriageEngine } from '@/lib/domain/logic/triage-engine';
import { createMockProbe, createMockResult } from '../../factories/assessment-factory';

describe('TriageEngine', () => {
    describe('Scenario A: Detección de Infección (Misconception)', () => {
        it('debe devolver una mutación INSERT_NODE apuntando al recurso de refutación cuando se elige el distractor crítico', () => {
            // Given: Una pregunta diseñada para detectar el error "Masa vs Peso"
            const probe = createMockProbe('misconception');
            const result = createMockResult(probe.id, 'opt-misconception');

            // When: El motor evalúa el resultado
            const mutations = TriageEngine.evaluate(probe, result);

            // Then: Debe haber una mutación de inserción antes con estado 'infected'
            expect(mutations).toHaveLength(1);
            expect(mutations[0].action).toBe('INSERT_NODE');
            expect(mutations[0].targetNodeId).toBe(probe.competencyId);
            expect(mutations[0].metadata.newStatus).toBe('infected');
            expect(mutations[0].metadata.contentId).toBe('error-masa-vs-peso');
            expect(mutations[0].reason).toContain('Detectado error conceptual específico');
        });
    });

    describe('Scenario B: Detección de Brecha (Gap)', () => {
        it('debe devolver una mutación INSERT_NODE con estado "locked" para andamiaje cuando falla una opción genérica', () => {
            // Given: Una pregunta estándar
            const probe = createMockProbe('gap');
            const result = createMockResult(probe.id, 'opt-gap');

            // When: El motor evalúa el resultado
            const mutations = TriageEngine.evaluate(probe, result);

            // Then: Debe sugerir andamiaje (locked/before)
            expect(mutations).toHaveLength(1);
            expect(mutations[0].action).toBe('INSERT_NODE');
            expect(mutations[0].metadata.newStatus).toBe('locked');
            expect(mutations[0].metadata.position).toBe('BEFORE');
            expect(mutations[0].reason).toContain('Brecha de conocimiento detectada');
        });
    });

    describe('Scenario C: Confirmación de Maestría', () => {
        it('debe devolver una mutación UNLOCK_NEXT cuando el alumno acierta', () => {
            // Given: El alumno acierta
            const probe = createMockProbe('mastery');
            const result = createMockResult(probe.id, 'opt-correct');

            // When: El motor evalúa el resultado
            const mutations = TriageEngine.evaluate(probe, result);

            // Then: El motor devuelve UNLOCK_NEXT
            expect(mutations).toHaveLength(1);
            expect(mutations[0].action).toBe('UNLOCK_NEXT');
            expect(mutations[0].metadata.newStatus).toBe('mastered');
            expect(mutations[0].reason).toContain('Dominio de competencia confirmado');
        });
    });

    it('debe lanzar un error si la opción seleccionada no existe en el probe', () => {
        const probe = createMockProbe('mastery');
        const result = createMockResult(probe.id, 'non-existent-option');

        expect(() => TriageEngine.evaluate(probe, result)).toThrow(/no encontrada/);
    });
});
