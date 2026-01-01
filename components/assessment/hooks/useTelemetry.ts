'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { TelemetryData } from '@/lib/domain/assessment';

type InteractionType = 'HOVER' | 'CHANGE' | 'CLICK';

/**
 * Hook for capturing forensic telemetry during question interaction
 * Measures cognitive load through hesitation, focus loss, and time spent
 */
export function useTelemetry() {
    const startTimeRef = useRef<number>(0);
    const firstTouchTimeRef = useRef<number | null>(null);
    const lastInteractionTimeRef = useRef<number>(0);

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

        setHesitationCount(0);
        setFocusLostCount(0);
        setConfidence(undefined);
    }, []);

    /**
     * Log an interaction event
     */
    const logInteraction = useCallback((type: InteractionType) => {
        const now = Date.now();

        // Capture TTFT
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
    }, []);

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
        const timeMs = now - startTimeRef.current;

        // TTFT: If never touched, it equals total time (passive abandonment) or 0? 
        // Let's say if null, it's timeMs (never acted)
        const ttft = firstTouchTimeRef.current ? (firstTouchTimeRef.current - startTimeRef.current) : timeMs;

        // Confirmation Latency: Time since last meaningful interaction to now (submit)
        const confirmationLatency = now - lastInteractionTimeRef.current;

        return {
            timeMs,
            hesitationCount,
            focusLostCount,
            confidence,
            ttft,
            confirmationLatency,
            hoverTimeMs: 0 // Legacy support, default 0 for mobile
        };
    }, [hesitationCount, focusLostCount, confidence]);

    /**
     * Track window blur events (focus loss)
     */
    useEffect(() => {
        const handleBlur = () => {
            setFocusLostCount((prev) => prev + 1);
        };

        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
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
