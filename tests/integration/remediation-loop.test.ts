import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAssessmentUseCase } from '../../lib/application/use-cases/process-assessment-use-case';
import { TriageEngine } from '../../lib/domain/logic/triage-engine';
import { PathMutation } from '../../lib/domain/triage';

// Mock Dependencies
const mockExecuteMutations = vi.fn();

vi.mock('../../lib/infrastructure/di', () => ({
    getStudentService: () => ({
        executeMutations: mockExecuteMutations
    })
}));

vi.mock('../../lib/infrastructure/supabase/supabase-server', () => ({
    createClient: () => ({ /* Mock Supabase client if needed */ })
}));

describe('Remediation Loop Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inject refutation content when MISCONCEPTION is detected', async () => {
        // Arrange
        const mockProbe = {
            id: 'probe-1',
            competencyId: 'comp-fractions',
            options: [
                { id: 'opt-err', text: '2/8', isCorrect: false, diagnosesMisconceptionId: 'misc-linear-thinking', feedback: 'Adding denominators' }
            ]
        } as any;

        const mockResult = {
            learnerId: 'student-1',
            selectedOptionId: 'opt-err'
        } as any;

        // Act
        const response = await processAssessmentUseCase({ probe: mockProbe, result: mockResult });

        // Assert
        expect(response.success).toBe(true);
        expect(mockExecuteMutations).toHaveBeenCalledTimes(1);

        const calledMutations = mockExecuteMutations.mock.calls[0][1] as PathMutation[];
        expect(calledMutations).toHaveLength(2); // INSERT_NODE + LOCK_DOWNSTREAM

        const insertMutation = calledMutations.find(m => m.action === 'INSERT_NODE');
        expect(insertMutation).toBeDefined();
        expect(insertMutation?.metadata.newStatus).toBe('infected');
        expect(insertMutation?.metadata.contentId).toBe('misc-linear-thinking');

        const lockMutation = calledMutations.find(m => m.action === 'LOCK_DOWNSTREAM');
        expect(lockMutation).toBeDefined();
    });

    it('should unlock next node when MASTERY is confirmed', async () => {
        // Arrange
        const mockProbe = {
            id: 'probe-2',
            competencyId: 'comp-easy',
            options: [
                { id: 'opt-correct', text: 'Correct', isCorrect: true }
            ]
        } as any;

        const mockResult = {
            learnerId: 'student-1',
            selectedOptionId: 'opt-correct'
        } as any;

        // Act
        const response = await processAssessmentUseCase({ probe: mockProbe, result: mockResult });

        // Assert
        expect(mockExecuteMutations).toHaveBeenCalledWith('student-1', expect.arrayContaining([
            expect.objectContaining({ action: 'UNLOCK_NEXT' })
        ]));
    });
});
