'use client';

import { useRef, useState, useCallback } from 'react';
import { TelemetryEvent, AnswerUpdatePayload } from '@/lib/domain/pipeline/types';

export function useTelemetryQueue(initialAnswers: Record<string, any>) {
    const queue = useRef<TelemetryEvent[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
    const startTime = useRef<number>(Date.now());

    const trackEvent = useCallback((event: TelemetryEvent) => {
        queue.current.push(event);

        if (event.event_type === "ANSWER_UPDATE") {
            const payload = event.payload as unknown as AnswerUpdatePayload;
            setAnswers(prev => ({
                ...prev,
                [payload.questionId]: payload.value,
            }));
        }
    }, []);

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

        startTime.current = now;
    }, [trackEvent]);

    return {
        queue,
        answers,
        setAnswers,
        trackEvent,
        trackAnswer
    };
}
