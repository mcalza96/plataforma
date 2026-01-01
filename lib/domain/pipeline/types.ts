import { z } from "zod";

/**
 * Valid states for an exam attempt.
 */
export const ExamStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED", "ABANDONED"]);
export type ExamStatus = z.infer<typeof ExamStatusSchema>;

/**
 * Types of telemetry events that can be captured.
 */
export const TelemetryEventTypeSchema = z.enum([
    "ANSWER_UPDATE",
    "HESITATION",
    "FOCUS_LOST",
    "NAVIGATION",
]);
export type TelemetryEventType = z.infer<typeof TelemetryEventTypeSchema>;

/**
 * A single telemetry event.
 */
export const TelemetryEventSchema = z.object({
    event_type: TelemetryEventTypeSchema,
    timestamp: z.string().datetime().optional(), // ISO string, defaults to now() in DB
    payload: z.record(z.string(), z.any()), // Specific details for the event
});
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

/**
 * A batch of telemetry events delivered by the client.
 */
export const TelemetryBatchSchema = z.object({
    attemptId: z.string().uuid(),
    events: z.array(TelemetryEventSchema),
});
export type TelemetryBatch = z.infer<typeof TelemetryBatchSchema>;

/**
 * The structure of the exam state snapshot for hydration.
 */
export const ExamStateSchema = z.object({
    attemptId: z.string().uuid(),
    learnerId: z.string().uuid(),
    examConfigId: z.string().uuid(),
    currentState: z.record(z.string(), z.any()), // { q1: "A", q2: "SKIP" }
    resultsCache: z.record(z.string(), z.any()).optional().nullable(), // Store final evaluation
    status: ExamStatusSchema,
    startedAt: z.string().datetime(),
    lastActiveAt: z.string().datetime(),
    finishedAt: z.string().datetime().nullable().optional(),
    configSnapshot: z.object({
        matrix: z.any(), // The full config_json from exams
        questions: z.array(z.any()), // The Question[] array
    }),
});
export type ExamState = z.infer<typeof ExamStateSchema>;

/**
 * DTO for the ANSWER_UPDATE event payload.
 */
export interface AnswerUpdatePayload {
    questionId: string;
    value: any;
    timeSpentMs?: number;
}
