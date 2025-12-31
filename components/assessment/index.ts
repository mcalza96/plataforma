/**
 * Assessment Armory - Forensic Diagnostic Components
 * Export barrel for easy imports
 */

// Lego Components
export { LegoCBM } from './legos/LegoCBM';
export { LegoRanking } from './legos/LegoRanking';
export { LegoSpotting } from './legos/LegoSpotting';

// Shell Components
export { ExamShell } from './shell/ExamShell';
export { ExamSidebar } from './shell/ExamSidebar';

// Hooks
export { useTelemetry } from './hooks/useTelemetry';

// Re-export types
export type {
    Question,
    CBMQuestion,
    RankingQuestion,
    SpottingQuestion,
    QuestionMetadata,
    AnswerPayload,
    TelemetryData,
} from '@/lib/domain/assessment';
