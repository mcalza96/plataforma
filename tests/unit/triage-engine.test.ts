import { describe, it, expect } from 'vitest';
import { DiagnosticProbe, ProbeOption } from '../../lib/domain/assessment';
import { AssessmentResult } from '../../lib/domain/triage';
import { TriageEngine } from '../../lib/domain/logic/triage-engine';

describe('TriageEngine', () => {
    const mockCompetencyId = 'comp-123';

    const options = [
        new ProbeOption('Opción Correcta', true, '¡Bien!', null, 'opt-correct'),
        new ProbeOption('Error de Confusión', false, 'Confundiste A con B', 'misc-shadow-456', 'opt-misconception'),
        new ProbeOption('Error Genérico', false, 'Incorrecto', null, 'opt-gap'),
    ];

    const mockProbe = new DiagnosticProbe(
        'probe-1',
        mockCompetencyId,
        'multiple_choice_rationale',
        '¿Cuál es la capital de Francia?',
        options
    );

    it('should generate an UNLOCK_NEXT mutation when the correct option is selected', () => {
        const result = new AssessmentResult('res-1', 'probe-1', 'learner-1', 'opt-correct', 10);
        const mutations = TriageEngine.evaluate(mockProbe, result);

        expect(mutations).toHaveLength(1);
        expect(mutations[0].action).toBe('UNLOCK_NEXT');
        expect(mutations[0].metadata.newStatus).toBe('mastered');
    });

    it('should generate an INSERT_NODE mutation with "infected" status when a misconception is detected', () => {
        const result = new AssessmentResult('res-2', 'probe-1', 'learner-1', 'opt-misconception', 15);
        const mutations = TriageEngine.evaluate(mockProbe, result);

        expect(mutations).toHaveLength(1);
        expect(mutations[0].action).toBe('INSERT_NODE');
        expect(mutations[0].metadata.newStatus).toBe('infected');
        expect(mutations[0].metadata.contentId).toBe('misc-shadow-456');
    });

    it('should generate an INSERT_NODE mutation with "locked" status when a generic gap is detected', () => {
        const result = new AssessmentResult('res-3', 'probe-1', 'learner-1', 'opt-gap', 20);
        const mutations = TriageEngine.evaluate(mockProbe, result);

        expect(mutations).toHaveLength(1);
        expect(mutations[0].action).toBe('INSERT_NODE');
        expect(mutations[0].metadata.newStatus).toBe('locked');
    });

    it('should throw an error if the selected option is not found', () => {
        const result = new AssessmentResult('res-4', 'probe-1', 'learner-1', 'opt-invalid', 5);
        expect(() => TriageEngine.evaluate(mockProbe, result)).toThrow();
    });
});
