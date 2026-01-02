/**
 * Pedagogical Pathology Thresholds
 * Constants defining critical bounds for item health and cognitive integrity.
 */

export const PATHOLOGY_THRESHOLDS = {
    /** High Slip (>40% experts failing) indicates ambiguity or key error */
    HIGH_SLIP_CRITICAL: 0.4,

    /** Low usage (<5% selection) marks a distractor as noise */
    USELESS_DISTRACTOR_LIMIT: 0.05,

    /** Concept Drift (>15% drop in weekly performance) */
    CONCEPT_DRIFT_ALARM: 0.15,

    /** High Disparity (>20% gap in groups) in DIF detection */
    DIF_GAP_WARNING: 0.2,

    /** Cognitive Label Bias (>15% rate difference) */
    LABEL_BIAS_THRESHOLD: 0.15,

    /** Rapid Guessing Floor (ms) */
    RTE_TIME_FLOOR_MS: 300,
};
