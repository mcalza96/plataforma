import { describe, it, expect } from 'vitest';
import { calculateBehaviorProfile, calculateTemporalEntropy, isFragileCertainty } from '../../../lib/domain/evaluation/behavior-detector';
import { StudentResponse } from '../../../lib/domain/evaluation/types';

describe('Mobile Behavior Detector (Decision Latency)', () => {

    it('should calculate Temporal Entropy (Hi) correctly', () => {
        // Changes * 0.5 + Revisits * 1.0
        // 4 changes, 2 revisits => (4*0.5) + (2*1) = 2 + 2 = 4
        expect(calculateTemporalEntropy(4, 2)).toBe(4);

        // 0 changes, 0 revisits => 0
        expect(calculateTemporalEntropy(0, 0)).toBe(0);
    });

    it('should detect "Toxic Doubt" (High Entropy)', () => {
        const responses = [
            {
                isCorrect: true, // Irrelevant for entropy
                telemetry: {
                    hesitationCount: 4, // +2.0 Hi (4 * 0.5)
                    revisitCount: 1,    // +1.0 Hi
                    // Total Hi = 3.0 > Threshold (2.0)
                    timeMs: 5000,
                    focusLostCount: 0
                }
            }
        ] as StudentResponse[];

        const profile = calculateBehaviorProfile(responses);
        expect(profile.isAnxious).toBe(true); // Should be flagged as anxious/doubting
    });

    it('should detect "Fragile Certainty" (Correct but Slow)', () => {
        // Correct answer, minimal changes, but HUGE confirmation latency (High Z-Score)
        const responses = [
            {
                isCorrect: true,
                telemetry: {
                    hesitationCount: 0,
                    revisitCount: 0,
                    timeMs: 15000,
                    zScore: 3.5 // > 2.0 (Mobile Threshold)
                }
            }
        ] as StudentResponse[];

        const profile = calculateBehaviorProfile(responses);
        expect(profile.isAnxious).toBe(true); // Fragile Certainty contributes to Anxiety bucket
    });

    it('should NOT detect Anxiety for methodical behavior (Low Entropy)', () => {
        const responses = [
            {
                isCorrect: true,
                telemetry: {
                    hesitationCount: 1, // 0.5
                    revisitCount: 0,    // 0
                    // Hi = 0.5 < 2.0
                    timeMs: 4000
                }
            }
        ] as StudentResponse[];

        const profile = calculateBehaviorProfile(responses);
        expect(profile.isAnxious).toBe(false);
    });
});
