'use client';

import { useCallback, useRef, useEffect } from 'react';
import { TelemetryEvent, TelemetryBatch } from '@/lib/domain/pipeline/types';
import { submitTelemetryBatch } from '@/lib/actions/telemetry/telemetry-actions';

interface UseTelemetrySyncProps {
    attemptId: string;
    queue: React.MutableRefObject<TelemetryEvent[]>;
    isPending: boolean;
    startTransition: (scope: () => Promise<void>) => void;
    onSyncSuccess: () => void;
}

export function useTelemetrySync({
    attemptId,
    queue,
    isPending,
    startTransition,
    onSyncSuccess
}: UseTelemetrySyncProps) {
    const retryTimeout = useRef<NodeJS.Timeout | null>(null);

    const sync = useCallback(async () => {
        if (queue.current.length === 0 || isPending) return;

        const eventsToSync = [...queue.current];
        const batch: TelemetryBatch = {
            attemptId,
            events: eventsToSync,
        };

        startTransition(async () => {
            try {
                const result = await submitTelemetryBatch(batch);
                if (result.success) {
                    queue.current = queue.current.filter(e => !eventsToSync.includes(e));
                    onSyncSuccess();
                } else if (result.retryAfter) {
                    console.warn(`Rate limited. Retrying after ${result.retryAfter}ms`);
                    if (retryTimeout.current) clearTimeout(retryTimeout.current);
                    retryTimeout.current = setTimeout(sync, result.retryAfter + 100);
                }
            } catch (error) {
                console.error("Critical sync error:", error);
            }
        });
    }, [attemptId, isPending, queue, startTransition, onSyncSuccess]);

    return { sync, retryTimeout };
}
