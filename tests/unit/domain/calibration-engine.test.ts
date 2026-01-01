import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalibrationService } from '../../../lib/application/services/calibration-service';

// Mock Supabase
const mockInsert = vi.fn();
const mockSupabase = {
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                eq: () => ({
                    // Return mock attempts
                    data: table === 'exam_attempts' ? mockAttempts : null,
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

// Mock Data
// 5 Masters (Top), 5 Novices (Bottom)
const mockAttempts = [
    // Masters (High Score) - let's say they fail Question A (High Slip)
    { id: '1', score: 90, current_state: { 'q1': { isCorrect: false } } }, // Fail
    { id: '2', score: 88, current_state: { 'q1': { isCorrect: false } } }, // Fail
    { id: '3', score: 85, current_state: { 'q1': { isCorrect: true } } },  // Pass
    { id: '4', score: 95, current_state: { 'q1': { isCorrect: false } } }, // Fail
    // ... Middle ...
    { id: '5', score: 50, current_state: { 'q1': { isCorrect: false } } },
    { id: '6', score: 50, current_state: { 'q1': { isCorrect: false } } },
    // Novices (Low Score) - they fail (Expected)
    { id: '7', score: 20, current_state: { 'q1': { isCorrect: false } } },
    { id: '8', score: 10, current_state: { 'q1': { isCorrect: false } } },
    { id: '9', score: 15, current_state: { 'q1': { isCorrect: false } } },
    { id: '10', score: 5, current_state: { 'q1': { isCorrect: false } } },
];

describe('Calibration Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should calculate High Slip for questions where Masters fail', async () => {
        const service = new CalibrationService();
        await service.calculateItemParameters('exam-1');

        // Verify insertion into item_calibration_history
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            question_id: 'q1',
            slip_param: 1.0 // 3 out of 3 top masters failed (IDs 4, 1, 2).
        }));

        // Verify Alert triggered
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            alert_type: 'HIGH_SLIP',
            severity: 'CRITICAL'
        }));
    });
});
