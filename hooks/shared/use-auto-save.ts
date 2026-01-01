'use client';

import { useState, useEffect, useRef } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
    data: T,
    onSave: (data: T) => Promise<void>,
    delay: number = 2000
) {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [lastError, setLastError] = useState<Error | null>(null);
    const initialRender = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Skip auto-save on initial render
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        // Cleanup previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setStatus('saving');

        timeoutRef.current = setTimeout(async () => {
            try {
                await onSave(data);
                setStatus('saved');
                // Back to idle after showing success for a while
                setTimeout(() => setStatus(prev => prev === 'saved' ? 'idle' : prev), 3000);
            } catch (err) {
                console.error('Auto-save failed:', err);
                setLastError(err instanceof Error ? err : new Error('Unknown error during auto-save'));
                setStatus('error');

                // Fallback to local storage if desired by the consumer
                try {
                    localStorage.setItem('phase_workshop_backup', JSON.stringify(data));
                } catch (e) {
                    console.error('Failed to save backup to localStorage:', e);
                }
            }
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, delay]); // We intentionally leave onSave out as it might be unstable, but ideally it's memoized

    return { status, lastError };
}
