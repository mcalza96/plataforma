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

            // Auto-detect HESITATION: if answering the same question with a different value
            // and it wasn't null/empty before.
            setAnswers(prev => {
                const prevValue = prev[payload.questionId];
                if (prevValue !== undefined && prevValue !== payload.value) {
                    // Emit HESITATION event
                    queue.current.push({
                        event_type: "HESITATION",
                        payload: {
                            questionId: payload.questionId,
                            from: prevValue,
                            to: payload.value,
                            timestamp: new Date().toISOString()
                        }
                    });
                }

                return {
                    ...prev,
                    [payload.questionId]: payload.value,
                };
            });
        }
    }, []);

    const trackAnswer = useCallback((questionId: string, value: any, telemetry: any = {}) => {
        const now = Date.now();
        const autoTimeSpentMs = now - startTime.current;

        // Calculate hesitation count for THIS question from the queue
        const hesitationCount = queue.current.filter(
            e => e.event_type === "HESITATION" && e.payload.questionId === questionId
        ).length;

        trackEvent({
            event_type: "ANSWER_UPDATE",
            payload: {
                questionId,
                value,
                telemetry: {
                    timeMs: telemetry.timeMs || autoTimeSpentMs,
                    hesitationCount: hesitationCount,
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
