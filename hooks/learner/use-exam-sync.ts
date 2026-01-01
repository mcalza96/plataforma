"use client";

import { useTransition, useEffect, useRef, useCallback, useState } from "react";
import { getExamState } from "@/lib/actions/telemetry-actions";
import { useTelemetryQueue } from "./parts/use-telemetry-queue";
import { useTelemetrySync } from "./parts/use-telemetry-sync";

const SYNC_INTERVAL_MS = 10000; // 10 seconds

/**
 * useExamSync: Orchestrates telemetry tracking and server synchronization.
 */
export function useExamSync(attemptId: string, initialAnswers: Record<string, any> = {}) {
    const [isPending, startTransition] = useTransition();
    const [isHydrating, setIsHydrating] = useState(true);
    const lastSyncedAnswers = useRef<Record<string, any>>(initialAnswers);

    // 1. Queue Management
    const {
        queue,
        answers,
        setAnswers,
        trackEvent,
        trackAnswer
    } = useTelemetryQueue(initialAnswers);

    // 2. Sync Logic
    const { sync, retryTimeout } = useTelemetrySync({
        attemptId,
        queue,
        isPending,
        startTransition,
        onSyncSuccess: () => {
            lastSyncedAnswers.current = { ...answers };
        }
    });

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
    }, [attemptId, setAnswers]);

    // Periodic sync
    useEffect(() => {
        const timer = setInterval(sync, SYNC_INTERVAL_MS);
        return () => {
            clearInterval(timer);
            if (retryTimeout.current) clearTimeout(retryTimeout.current);
        };
    }, [sync, retryTimeout]);

    // Final Sync on window close
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (queue.current.length > 0) {
                sync();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [sync, queue]);

    return {
        trackEvent,
        trackAnswer,
        sync,
        isSyncing: isPending,
        isHydrating,
        currentAnswers: answers,
    };
}
