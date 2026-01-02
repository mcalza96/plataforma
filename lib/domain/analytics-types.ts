/**
 * Analytics Domain Types
 * Precise interfaces for database views and analytics computations.
 */

// --- Database Row Interfaces (Views) ---

export interface PathologyRankingRow {
    competency_id: string;
    state: 'MASTERED' | 'MISCONCEPTION' | 'NEUTRAL' | string;
    total_occurrences: number;
    avg_confidence_score: number;
    avg_hesitation_index?: number;
    reason?: string;
    teacher_id: string;
    exam_id: string;
}

export interface ItemHealthRow {
    question_id: string;
    exam_id: string;
    teacher_id: string;
    total_responses: number;
    accuracy_rate: number;
    median_time_ms: number;
    health_status: 'HEALTHY' | 'BROKEN' | 'TRIVIAL';
    slip_param?: number;
    guess_param?: number;
}

export interface CohortRadarRow {
    student_id: string;
    exam_id: string;
    teacher_id: string;
    overall_score: number;
    ece_score: number;
    student_archetype: 'MASTER' | 'AT_RISK' | 'OVERCONFIDENT' | 'UNDERCONFIDENT' | string;
    is_impulsive?: boolean;
    is_anxious?: boolean;
}

export interface RemediationFairnessRow {
    demographic_group: string;
    access_type: 'mobile' | 'desktop';
    total_attempts: number;
    failed_attempts: number;
    avg_score: number;
    intervention_rate: number;
    teacher_id: string;
}

export interface ItemDIFRow {
    question_id: string;
    dimension: 'gender' | 'access_type' | 'region';
    gap: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

// --- Domain/DTO Interfaces (CamelCase for Component consumption) ---

export interface CohortMember {
    studentId: string;
    examId: string;
    overallScore: number;
    eceScore: number;
    studentArchetype: string;
    isImpulsive: boolean;
    isAnxious: boolean;
}

export interface Pathology {
    competencyId: string;
    state: string;
    totalOccurrences: number;
    avgConfidenceScore: number;
    avgHesitationIndex: number;
    reason: string;
}

export interface TeacherAnalyticsResult {
    cohortRadar: CohortMember[];
    pathologyRanking: Pathology[];
}

// --- Knowledge Graph Interfaces ---

export interface GraphNode {
    id: string;
    label: string;
    title?: string; // Compatibility with legacy
    description?: string;
    status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' | 'MASTERED' | 'INFECTED';
    infectionReason?: string;
    level: number;
    // Admin specific metrics
    studentCount?: number;
    averageMastery?: number;
    frictionScore?: number;
    topBugs?: string[];
}

export interface GraphEdge {
    from: string;
    to: string;
    source?: string; // Compatibility
    target?: string; // Compatibility
    weight?: number;
}

export interface KnowledgeGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
