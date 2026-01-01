'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { TelemetryData } from '@/lib/domain/assessment';

type InteractionType = 'HOVER' | 'CHANGE' | 'CLICK';

/**
 * Hook for capturing forensic telemetry during question interaction
 * Measures cognitive load through hesitation, focus loss, and time spent
 */
export function useTelemetry() {
    // Timing Refs
    const startTimeRef = useRef<number>(0);
    const firstTouchTimeRef = useRef<number | null>(null);
    const lastInteractionTimeRef = useRef<number>(0);

    // Active Time Tracking Refs
    const accumulatedPauseTimeRef = useRef<number>(0);
    const lastBlurTimeRef = useRef<number | null>(null);

    const [hesitationCount, setHesitationCount] = useState(0);
    const [focusLostCount, setFocusLostCount] = useState(0);
    const [confidence, setConfidence] = useState<'LOW' | 'MEDIUM' | 'HIGH' | undefined>(undefined);

    /**
     * Start tracking telemetry (call when question mounts)
     */
    const start = useCallback(() => {
        const now = Date.now();
        startTimeRef.current = now;
        firstTouchTimeRef.current = null;
        lastInteractionTimeRef.current = now; // Initialize to start time
        accumulatedPauseTimeRef.current = 0;
        lastBlurTimeRef.current = null;

        setHesitationCount(0);
        setFocusLostCount(0);
        setConfidence(undefined);
    }, []);

    /**
     * Helper to get current "Active Time" (Wall Time - Paused Time)
     */
    const getActiveTime = useCallback(() => {
        const now = Date.now();
        const wallTime = now - startTimeRef.current;

        // If currently blurred, add the pending pause segment
        let currentPendingPause = 0;
        if (lastBlurTimeRef.current !== null) {
            currentPendingPause = now - lastBlurTimeRef.current;
        }

        return Math.max(0, wallTime - (accumulatedPauseTimeRef.current + currentPendingPause));
    }, []);

    /**
     * Log an interaction event
     */
    const logInteraction = useCallback((type: InteractionType) => {
        const activeTime = getActiveTime();
        // We use active time for TTFT if we wanted relative to start, but usually timestamps are absolute.
        // Let's stick to absolute timestamps for refs, but subtract pause for final duration.

        const now = Date.now();

        // Capture TTFT (First Meaningful Interaction)
        if (firstTouchTimeRef.current === null) {
            firstTouchTimeRef.current = now;
        }

        // Update last interaction time for confirmation latency
        if (type === 'CHANGE' || type === 'CLICK') {
            lastInteractionTimeRef.current = now;
        }

        if (type === 'CHANGE') {
            setHesitationCount((prev) => prev + 1);
        }
    }, [getActiveTime]);

    /**
     * Set confidence level (for CBM questions)
     */
    const setConfidenceLevel = useCallback((level: 'LOW' | 'MEDIUM' | 'HIGH') => {
        // Interacting with confidence selector counts as interaction
        if (firstTouchTimeRef.current === null) {
            firstTouchTimeRef.current = Date.now();
        }
        lastInteractionTimeRef.current = Date.now();

        setConfidence(level);
    }, []);

    /**
     * Capture final telemetry snapshot
     */
    const captureSnapshot = useCallback((): TelemetryData => {
        const now = Date.now();

        // Calculate Final Active Time
        const activeTimeMs = getActiveTime();

        // TTFT: Time to First Touch (Absolute difference, unadjusted for pause usually, 
        // but if they blurred BEFORE touching, it should be deducted? 
        // Simpler: TTFT is Wall Clock time to first touch. If they left the tab, they hesitated.)
        // However, "Active Time" is for RTE. 
        // Let's keep TTFT as Wall Clock difference for now, as it signifies "latency to engage".
        const ttft = firstTouchTimeRef.current ? (firstTouchTimeRef.current - startTimeRef.current) : activeTimeMs;

        // Confirmation Latency: Time from last meaningful interaction to now.
        // Should we deduct pause here? If they changed answer, blurred, returned, confirmed... the latency IS high.
        const confirmationLatency = now - lastInteractionTimeRef.current;

        return {
            timeMs: activeTimeMs, // This IS the Active Time for RTE
            hesitationCount,
            focusLostCount,
            confidence,
            ttft,
            confirmationLatency,
            hoverTimeMs: 0 // Mobile has no hover, explicitly 0
        };
    }, [hesitationCount, focusLostCount, confidence, getActiveTime]);

    /**
     * Track window blur/focus events (Focus Tracking)
     */
    useEffect(() => {
        const handleBlur = () => {
            setFocusLostCount((prev) => prev + 1);
            lastBlurTimeRef.current = Date.now();
        };

        const handleFocus = () => {
            if (lastBlurTimeRef.current !== null) {
                const blurDuration = Date.now() - lastBlurTimeRef.current;
                accumulatedPauseTimeRef.current += blurDuration;
                lastBlurTimeRef.current = null;
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return {
        start,
        logInteraction,
        setConfidenceLevel,
        captureSnapshot,
        // Expose current values for debugging/display
        currentMetrics: {
            hesitationCount,
            focusLostCount,
            confidence,
        },
    };
}
