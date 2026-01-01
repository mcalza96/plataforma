
import { describe, it, expect } from 'vitest';
import { calculateBehaviorProfile, calculateTemporalEntropy, isFragileCertainty } from '@/lib/domain/evaluation/behavior-detector';
import { StudentResponse } from '@/lib/domain/evaluation/types';

describe('Mobile Behavior Detector (Decision Latency)', () => {

    describe('calculateTemporalEntropy', () => {
        it('should return high entropy for multiple revisits and changes', () => {
            // Hi = (2 changes * 0.5) + (3 revisits * 1.0) = 4.0
            const entropy = calculateTemporalEntropy(2, 3);
            expect(entropy).toBe(4.0);
        });

        it('should return 0 for clean navigation', () => {
            const entropy = calculateTemporalEntropy(0, 0);
            expect(entropy).toBe(0);
        });
    });

    describe('isFragileCertainty', () => {
        it('should detect fragile certainty when zScore > 3.0 and correct', () => {
            expect(isFragileCertainty(true, 3.1)).toBe(true);
        });

        it('should NOT detect fragile certainty if incorrect', () => {
            expect(isFragileCertainty(false, 3.1)).toBe(false);
        });

        it('should NOT detect fragile certainty if zScore is low', () => {
            expect(isFragileCertainty(true, 1.5)).toBe(false);
        });
    });

    describe('Scenario 1: Toxic Doubt', () => {
        it('should classify high entropy student as Anxious', () => {
            const mockResponses: StudentResponse[] = Array(5).fill(null).map((_, i) => ({
                questionId: `q${i}`,
                selectedOptionId: 'opt1',
                isCorrect: true,
                confidence: 'HIGH',
                telemetry: {
                    timeMs: 20000,
                    hesitationCount: 3, // 3 * 0.5 = 1.5
                    hoverTimeMs: 0,
                    focusLostCount: 0,
                    revisitCount: 2, // 2 * 1.0 = 2.0 -> Total Hi = 3.5 (> 2.0 threshold)
                    ttft: 1000,
                    confirmationLatency: 5000
                }
            }));

            const profile = calculateBehaviorProfile(mockResponses);
            expect(profile.isAnxious).toBe(true);
        });
    });

    describe('Scenario 2: Impulsivity', () => {
        it('should classify rapid guessing as Impulsive', () => {
            const mockResponses: StudentResponse[] = Array(5).fill(null).map((_, i) => ({
                questionId: `q${i}`,
                selectedOptionId: 'opt1',
                isCorrect: false,
                confidence: 'HIGH',
                telemetry: {
                    timeMs: 500, // < 2000ms threshold
                    hesitationCount: 0,
                    hoverTimeMs: 0,
                    focusLostCount: 0,
                    revisitCount: 0,
                    ttft: 200,
                    confirmationLatency: 100
                }
            }));

            const profile = calculateBehaviorProfile(mockResponses);
            expect(profile.isImpulsive).toBe(true);
        });
    });
});
