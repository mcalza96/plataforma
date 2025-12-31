import { SupabaseClient } from "@supabase/supabase-js";
import { TelemetryEvent, ExamStatus } from "@/lib/domain/pipeline/types";

export class SupabaseTelemetryRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    /**
     * Bulk inserts telemetry events into the database.
     * @param attemptId Unique ID of the exam attempt.
     * @param events Array of telemetry events to save.
     */
    async saveBatch(attemptId: string, events: TelemetryEvent[]): Promise<void> {
        if (events.length === 0) return;

        const { error } = await this.supabase.from("telemetry_logs").insert(
            events.map((event) => ({
                attempt_id: attemptId,
                event_type: event.event_type,
                payload: event.payload,
                timestamp: event.timestamp || new Date().toISOString(),
            }))
        );

        if (error) {
            console.error("Failed to save telemetry batch:", error);
            throw new Error(`Telemetry save failed: ${error.message}`);
        }
    }

    /**
     * Updates the exam attempt snapshot with the latest state.
     * Uses JSONB merging to update specific keys without overwriting the entire state
     * if needed, but for simple key-value answers, a direct update is often sufficient.
     * @param attemptId Unique ID of the exam attempt.
     * @param latestAnswers Partial or full update of the current answers map.
     */
    async updateSnapshot(
        attemptId: string,
        latestAnswers: Record<string, any>
    ): Promise<void> {
        // Strategy: Merge the new answers into the existing current_state JSONB.
        // In PostgreSQL, we can use the || operator for JSONB merge.
        const { error } = await this.supabase
            .from("exam_attempts")
            .update({
                // We use a raw fragment if we want to merge, but Supabase JS client 
                // usually works better with direct object updates if we have the full state.
                // Given the requirement "Double Writing", we update current_state and last_active_at.
                current_state: latestAnswers, // For now, we overwrite with the latest full mapping from client
                last_active_at: new Date().toISOString(),
            })
            .eq("id", attemptId);

        if (error) {
            console.error("Failed to update exam snapshot:", error);
            throw new Error(`Snapshot update failed: ${error.message}`);
        }
    }

    /**
     * Fetches the current state of an exam attempt for hydration.
     * @param attemptId Unique ID of the exam attempt.
     */
    async getExamState(attemptId: string) {
        const { data, error } = await this.supabase
            .from("exam_attempts")
            .select("*")
            .eq("id", attemptId)
            .single();

        if (error || !data) {
            console.error("Failed to fetch exam state:", error);
            return null;
        }

        // Map snake_case database fields to camelCase domain types
        return {
            attemptId: data.id,
            learnerId: data.learner_id,
            examConfigId: data.exam_config_id,
            currentState: data.current_state,
            resultsCache: data.results_cache,
            status: data.status,
            startedAt: data.started_at,
            lastActiveAt: data.last_active_at,
            finishedAt: data.finished_at,
        };
    }
}
