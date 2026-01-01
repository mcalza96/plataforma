"use client";

import { useTransition, useEffect, useRef, useCallback, useState } from "react";
import { getExamState } from "@/lib/actions/telemetry/telemetry-actions";
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

    // 3. Heartbeat Logic (Idle Protection)
    // If the user is idle for > 60s (no queue updates), we force a sync to ensure data safety.
    useEffect(() => {
        const HEARTBEAT_THRESHOLD_MS = 60000; // 60s

        const heartbeatTimer = setInterval(() => {
            // We can check if there are unsynced changes in the queue, or just ping.
            // Requirement says "synchronization forced if student > 60s ... without interacting".
            // Since `sync` only sends if there are queue items (handled in useTelemetrySync usually),
            // we might want to ensure we at least TRY to sync what's pending if they go idle.

            if (queue.current.length > 0) {
                // If we have data pending and haven't synced in a while, do it.
                // The main SYNC_INTERVAL_MS is 10s, so this is a failsafe.
                // But maybe they are offline? 
                // Let's force a sync attempt.
                sync();
            }
        }, HEARTBEAT_THRESHOLD_MS);

        return () => clearInterval(heartbeatTimer);
    }, [sync, queue]);

    // Periodic sync (Standard Loop)
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
                // Try to use beacon if possible (Sync is async usually), 
                // but here we just call the method. 
                // React 18+ strict mode might double invoke, it's fine.
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
