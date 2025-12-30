import { DiagnosticProbe, ProbeOption, ProbeType } from '@/lib/domain/assessment';
import { AssessmentResult } from '@/lib/domain/triage';

export const createMockOption = (overrides: Partial<ProbeOption> = {}): ProbeOption => {
    return new ProbeOption(
        overrides.content || 'Mock content',
        overrides.isCorrect ?? false,
        overrides.feedback || null,
        overrides.diagnosesMisconceptionId || null,
        overrides.id || `opt-${Math.random().toString(36).substr(2, 9)}`
    );
};

export const createMockProbe = (
    type: 'misconception' | 'gap' | 'mastery',
    overrides: Partial<DiagnosticProbe> = {}
): DiagnosticProbe => {
    const options: ProbeOption[] = [];

    if (type === 'misconception') {
        options.push(createMockOption({ content: 'Correct Answer', isCorrect: true, id: 'opt-correct' }));
        options.push(createMockOption({
            content: 'Misconception Distractor',
            isCorrect: false,
            diagnosesMisconceptionId: 'error-masa-vs-peso',
            feedback: 'Confundiste masa con peso.',
            id: 'opt-misconception'
        }));
    } else if (type === 'gap') {
        options.push(createMockOption({ content: 'Correct Answer', isCorrect: true, id: 'opt-correct' }));
        options.push(createMockOption({
            content: 'Generic Error',
            isCorrect: false,
            id: 'opt-gap'
        }));
    } else {
        options.push(createMockOption({ content: 'Correct Answer', isCorrect: true, id: 'opt-correct' }));
        options.push(createMockOption({ content: 'Incorrect Answer', isCorrect: false, id: 'opt-wrong' }));
    }

    return new DiagnosticProbe(
        overrides.id || 'probe-123',
        overrides.competencyId || 'comp-456',
        overrides.type || 'multiple_choice_rationale',
        overrides.stem || 'What is the difference between mass and weight?',
        options,
        overrides.metadata || {}
    );
};

export const createMockResult = (
    probeId: string,
    selectedOptionId: string,
    overrides: Partial<AssessmentResult> = {}
): AssessmentResult => {
    return new AssessmentResult(
        overrides.id || 'res-789',
        probeId,
        overrides.learnerId || 'learner-001',
        selectedOptionId,
        overrides.timeSpentSeconds || 30,
        overrides.createdAt || new Date()
    );
};
