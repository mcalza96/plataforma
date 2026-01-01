import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalibrationService } from '../../../lib/application/services/calibration-service';

// Mock Supabase
const mockInsert = vi.fn();
const mockSupabase = {
    from: (table: string) => ({
        select: (query: string) => ({
            eq: () => ({
                eq: () => ({
                    // Return mock attempts for DIF scenario
                    data: table === 'exam_attempts' ? mockDIFAttempts : null,
                    error: null
                }),
                single: () => ({ data: { creator_id: 'teacher-1' } }) // Mock exam owner fetch
            })
        }),
        insert: mockInsert
    })
};

vi.mock('@/lib/infrastructure/supabase/supabase-server', () => ({
    createClient: () => mockSupabase
}));

// Mock DIF Data:
// Group A (Privileged/Reference) vs Group B (Focal)
// We simulate High Ability context (Score > 80)
// Group A pass rate = 100%
// Group B pass rate = 0%
// This is blatant Bias.
const mockDIFAttempts = [
    // Group A - High Score - Pass Q1
    { id: '1', score: 95, current_state: { 'q1': { isCorrect: true } }, learner: { demographic_group: 'Group A' } },
    { id: '2', score: 90, current_state: { 'q1': { isCorrect: true } }, learner: { demographic_group: 'Group A' } },
    { id: '2a', score: 92, current_state: { 'q1': { isCorrect: true } }, learner: { demographic_group: 'Group A' } },

    // Group B - High Score - Fail Q1
    { id: '3', score: 95, current_state: { 'q1': { isCorrect: false } }, learner: { demographic_group: 'Group B' } },
    { id: '4', score: 90, current_state: { 'q1': { isCorrect: false } }, learner: { demographic_group: 'Group B' } },
    { id: '4a', score: 93, current_state: { 'q1': { isCorrect: false } }, learner: { demographic_group: 'Group B' } },

    // Low scores... ignored by logic or just noise
    { id: '5', score: 20, current_state: { 'q1': { isCorrect: false } }, learner: { demographic_group: 'Group A' } },
];

describe('Fairness Engine (DIF)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should detect Differential Item Functioning (DIF) in high-ability groups', async () => {
        const service = new CalibrationService();
        await service.detectItemBias('exam-fairness');

        // We expect an alert for Question Q1
        // Group A Rate ~1.0, Group B Rate ~0.0. Diff 1.0 > 0.2.
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            question_id: 'q1',
            alert_type: 'DIF_DETECTED',
            message: expect.stringContaining('Posible funcionamiento diferencial')
        }));
    });
});
