"use client";

import { useTransition, useEffect, useRef, useCallback } from "react";
import {
    TelemetryEvent,
    TelemetryBatch,
    AnswerUpdatePayload
} from "@/lib/domain/pipeline/types";
import { submitTelemetryBatch } from "@/lib/actions/telemetry-actions";

const SYNC_INTERVAL_MS = 10000; // 10 seconds

export function useExamSync(attemptId: string, initialAnswers: Record<string, any> = {}) {
    const [isPending, startTransition] = useTransition();
    const queue = useRef<TelemetryEvent[]>([]);
    const lastSyncedAnswers = useRef<Record<string, any>>(initialAnswers);
    const currentAnswers = useRef<Record<string, any>>(initialAnswers);
    const retryTimeout = useRef<NodeJS.Timeout | null>(null);

    /**
     * Captures a new telemetry event and adds it to the local queue.
     */
    const trackEvent = useCallback((event: TelemetryEvent) => {
        queue.current.push(event);

        // If it's an answer update, update current answers ref
        if (event.event_type === "ANSWER_UPDATE") {
            const payload = event.payload as unknown as AnswerUpdatePayload;
            currentAnswers.current = {
                ...currentAnswers.current,
                [payload.questionId]: payload.value,
            };
        }
    }, []);

    /**
     * Utility to track an answer change easily.
     */
    const trackAnswer = useCallback((questionId: string, value: any) => {
        trackEvent({
            event_type: "ANSWER_UPDATE",
            payload: { questionId, value, timestamp: new Date().toISOString() },
        });
    }, [trackEvent]);

    /**
     * Sends the current queue to the server.
     */
    const sync = useCallback(async () => {
        if (queue.current.length === 0) return;

        const batch: TelemetryBatch = {
            attemptId,
            events: [...queue.current],
        };

        // We clear the queue optimistically, but we should restore it if it fails.
        // However, the requirement says: "Si la llamada al servidor falla, el hook NO debe limpiar la cola local."
        // So we'll keep a copy.
        const eventsToSync = [...queue.current];

        startTransition(async () => {
            try {
                const result = await submitTelemetryBatch(batch);
                if (result.success) {
                    // Remove only the events we successfully synced
                    queue.current = queue.current.filter(e => !eventsToSync.includes(e));
                    lastSyncedAnswers.current = { ...currentAnswers.current };
                } else if (result.retryAfter) {
                    // Rate limit hit: Wait and retry
                    console.warn(`Rate limited. Retrying after ${result.retryAfter}ms`);
                    if (retryTimeout.current) clearTimeout(retryTimeout.current);
                    retryTimeout.current = setTimeout(sync, result.retryAfter + 100);
                } else {
                    console.error("Sync failed:", result.error);
                }
            } catch (error) {
                console.error("Critical sync error:", error);
            }
        });
    }, [attemptId]);

    // Periodic sync
    useEffect(() => {
        const timer = setInterval(sync, SYNC_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [sync]);

    // Sync on window close / navigation
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (queue.current.length > 0) {
                // Since we can't easily wait for a fetch in beforeunload, 
                // we use keepalive in the server action if we were using fetch,
                // but here we are in a hook. Best effort:
                const batch: TelemetryBatch = {
                    attemptId,
                    events: [...queue.current],
                };

                // Use navigator.sendBeacon for more reliability if available
                // But sendBeacon only sends POST with body. Our server action is a POST.
                // For simplicity in this sprint, we just try to sync.
                sync();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [sync, attemptId]);

    return {
        trackEvent,
        trackAnswer,
        sync,
        isSyncing: isPending,
        currentAnswers: currentAnswers.current,
    };
}
