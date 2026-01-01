'use client';

import { useState, useTransition } from 'react';
import { Lesson } from '@/lib/domain/course';
import { upsertLesson } from '@/lib/admin-content-actions';
import { StepData } from '@/components/admin/StepCard';

export function useContextController(initialLesson: Lesson) {
    const [isPending, startTransition] = useTransition();
    const [lesson, setLesson] = useState<Lesson>(initialLesson);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const updateMetadata = (field: keyof Lesson, value: any) => {
        setLesson(prev => ({ ...prev, [field]: value }) as Lesson);
    };

    const saveContext = async (steps: StepData[]) => {
        startTransition(async () => {
            setStatus('saving');
            const payload = {
                ...lesson,
                description: JSON.stringify(steps),
                total_steps: steps.length
            };

            const result = await upsertLesson(payload as any);
            if (result.success) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        });
    };

    return {
        lesson,
        isPending: isPending || status === 'saving',
        status,
        updateMetadata,
        saveContext
    };
}
