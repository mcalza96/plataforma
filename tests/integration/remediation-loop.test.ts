import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processAssessmentUseCase } from '../../lib/application/use-cases/process-assessment-use-case';
import { PathMutation } from '../../lib/domain/triage';

// Mock Dependencies
const mockExecuteMutations = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseSelect = vi.fn().mockReturnValue({ data: { applied_mutations: [] } });

vi.mock('../../lib/infrastructure/di', () => ({
    getStudentService: () => ({
        executeMutations: mockExecuteMutations
    })
}));

vi.mock('../../lib/infrastructure/supabase/supabase-server', () => ({
    createClient: () => ({
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: mockSupabaseSelect
                })
            }),
            update: mockSupabaseUpdate.mockReturnValue({ eq: vi.fn() })
        })
    })
}));

describe('Remediation Loop Integration: Luz y Sombra Scenario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle "Sombreado Sucio" failure by injecting refutation and locking "Teoría del Color"', async () => {
        // Arrange: Student fails "Luz y Sombra" with specific misconception
        const mockProbe = {
            id: 'probe-luz-sombra',
            competencyId: 'comp-luz-sombra', // Luz y Sombra
            options: [
                {
                    id: 'opt-sombreado-sucio',
                    text: 'Sombreado Sucio',
                    isCorrect: false,
                    diagnosesMisconceptionId: 'misc-dirty-shading',
                    feedback: 'El sombreado sucio ocurre cuando...'
                }
            ]
        } as any;

        const mockResult = {
            learnerId: 'student-vincent',
            selectedOptionId: 'opt-sombreado-sucio',
            attemptId: 'attempt-123' // Required for forensic logging
        } as any;

        // Act
        const response = await processAssessmentUseCase({ probe: mockProbe, result: mockResult });

        // Assert
        expect(response.success).toBe(true);
        expect(mockExecuteMutations).toHaveBeenCalledTimes(1);

        const calledMutations = mockExecuteMutations.mock.calls[0][1] as PathMutation[];

        // 1. Verify Refutation Injection
        const insertMutation = calledMutations.find(m => m.action === 'INSERT_NODE');
        expect(insertMutation).toBeDefined();
        expect(insertMutation?.targetNodeId).toBe('comp-luz-sombra');
        expect(insertMutation?.metadata.contentId).toBe('misc-dirty-shading'); // Validation of content injection
        expect(insertMutation?.metadata.newStatus).toBe('infected');

        // 2. Verify Fog of War (Hard Pruning)
        const lockMutation = calledMutations.find(m => m.action === 'LOCK_DOWNSTREAM');
        expect(lockMutation).toBeDefined();
        expect(lockMutation?.targetNodeId).toBe('comp-luz-sombra');

        // 3. Verify Forensic Logging
        expect(mockSupabaseUpdate).toHaveBeenCalledWith(expect.objectContaining({
            applied_mutations: expect.arrayContaining([
                expect.objectContaining({
                    probeId: 'probe-luz-sombra',
                    mutations: expect.any(Array)
                })
            ])
        }));
    });
});

