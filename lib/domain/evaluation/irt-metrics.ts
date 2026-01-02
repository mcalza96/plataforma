/**
 * IRT (Item Response Theory) Metric Definitions
 * Pure functions for statistical calibration of pedagogical items.
 */

export class IRTMetrics {
    /**
     * Slip (s): Probability that an 'expert' (Master) student fails the item.
     * Formula: 1 - (Correct Masters / Total Valid Masters)
     */
    static calculateSlip(correctMasterCount: number, totalValidMasters: number): number {
        if (totalValidMasters === 0) return 0;
        return 1 - (correctMasterCount / totalValidMasters);
    }

    /**
     * Guess (g): Probability that a 'novice' student answers correctly.
     * Formula: Correct Novices / Total Valid Novices
     */
    static calculateGuess(correctNoviceCount: number, totalValidNovices: number): number {
        if (totalValidNovices === 0) return 0;
        return correctNoviceCount / totalValidNovices;
    }

    /**
     * Discrimination (D): Capacity of the item to distinguish between masters and novices.
     * Formula: Pass Rate (Masters) - Pass Rate (Novices)
     */
    static calculateDiscrimination(pUpper: number, pLower: number): number {
        return pUpper - pLower;
    }

    /**
     * Disparate Impact Ratio (4/5 Rule): Ratio of selection/success rates between groups.
     * Formula: Min Group Rate / Max Group Rate
     */
    static calculateImpactRatio(minRate: number, maxRate: number): number {
        if (maxRate === 0) return 1;
        return minRate / maxRate;
    }
}
