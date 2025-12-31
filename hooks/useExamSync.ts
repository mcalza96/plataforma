"use client";

import { useTransition, useEffect, useRef, useCallback, useState } from "react";
import {
    TelemetryEvent,
    TelemetryBatch,
    AnswerUpdatePayload
} from "@/lib/domain/pipeline/types";
import { submitTelemetryBatch, getExamState } from "@/lib/actions/telemetry-actions";

const SYNC_INTERVAL_MS = 10000; // 10 seconds

export function useExamSync(attemptId: string, initialAnswers: Record<string, any> = {}) {
    const [isPending, startTransition] = useTransition();
    const [isHydrating, setIsHydrating] = useState(true);
    const queue = useRef<TelemetryEvent[]>([]);

    // Use state for answers to ensure UI reactive updates when hydration completes
    const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
    const lastSyncedAnswers = useRef<Record<string, any>>(initialAnswers);
    const retryTimeout = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());

    /**
     * Hydration: Recover state from DB on mount
     */
    useEffect(() => {
        async function hydrate() {
            try {
                const state = await getExamState(attemptId);
                if (state && state.currentState) {
                    setAnswers(state.currentState);
                    lastSyncedAnswers.current = state.currentState;
                }
            } catch (error) {
                console.error("Hydration failed:", error);
            } finally {
                setIsHydrating(false);
            }
        }
        hydrate();
    }, [attemptId]);

    /**
     * Captures a new telemetry event and adds it to the local queue.
     */
    const trackEvent = useCallback((event: TelemetryEvent) => {
        queue.current.push(event);

        // If it's an answer update, update current answers
        if (event.event_type === "ANSWER_UPDATE") {
            const payload = event.payload as unknown as AnswerUpdatePayload;
            setAnswers(prev => ({
                ...prev,
                [payload.questionId]: payload.value,
            }));
        }
    }, []);

    /**
     * Utility to track an answer change easily.
     */
    const trackAnswer = useCallback((questionId: string, value: any, telemetry: any = {}) => {
        const now = Date.now();
        const autoTimeSpentMs = now - startTime.current;

        trackEvent({
            event_type: "ANSWER_UPDATE",
            payload: {
                questionId,
                value,
                telemetry: {
                    timeMs: telemetry.timeMs || autoTimeSpentMs,
                    hesitationCount: telemetry.hesitationCount || 0,
                    focusLostCount: telemetry.focusLostCount || 0,
                    confidence: telemetry.confidence
                },
                timestamp: new Date().toISOString()
            },
        });

        // Reset start time for the next interaction
        startTime.current = now;
    }, [trackEvent]);

    /**
     * Sends the current queue to the server.
     */
    const sync = useCallback(async () => {
        if (queue.current.length === 0 || isPending) return;

        // Snapshot of current queue to try and sync
        const eventsToSync = [...queue.current];

        const batch: TelemetryBatch = {
            attemptId,
            events: eventsToSync,
        };

        startTransition(async () => {
            try {
                const result = await submitTelemetryBatch(batch);
                if (result.success) {
                    // Remove only the events we successfully synced
                    // This handles the case where new events were added during the async call
                    queue.current = queue.current.filter(e => !eventsToSync.includes(e));
                    lastSyncedAnswers.current = { ...answers };
                } else if (result.retryAfter) {
                    // Rate limit hit: Wait and retry
                    console.warn(`Rate limited. Retrying after ${result.retryAfter}ms`);
                    if (retryTimeout.current) clearTimeout(retryTimeout.current);
                    retryTimeout.current = setTimeout(sync, result.retryAfter + 100);
                } else {
                    console.error("Sync failed:", result.error);
                    // Critical: If sync fails, events stay in queue.current for the next attempt.
                }
            } catch (error) {
                console.error("Critical sync error:", error);
            }
        });
    }, [attemptId, isPending, answers]);

    // Periodic sync
    useEffect(() => {
        const timer = setInterval(sync, SYNC_INTERVAL_MS);
        return () => {
            clearInterval(timer);
            if (retryTimeout.current) clearTimeout(retryTimeout.current);
        };
    }, [sync]);

    // Final Sync on window close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (queue.current.length > 0) {
                // Background sync attempt
                sync();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [sync]);

    return {
        trackEvent,
        trackAnswer,
        sync,
        isSyncing: isPending,
        isHydrating,
        currentAnswers: answers,
    };
}
