'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertLesson, deleteLesson } from '@/lib/admin-content-actions';
import { Lesson } from '@/lib/domain/course';

export function usePhaseEditor(initialLesson: Lesson, courseId: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState<Lesson>({ ...initialLesson });
    const [timelineKey, setTimelineKey] = useState(0);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const updateField = (field: keyof Lesson, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const save = async () => {
        startTransition(async () => {
            const payload = {
                ...formData,
                course_id: courseId,
                description: formData.description ?? undefined,
                thumbnail_url: formData.thumbnail_url ?? undefined,
                download_url: formData.download_url ?? undefined
            };
            const result = await upsertLesson(payload);
            if (result.success) {
                showMessage('success', 'Fase sincronizada con el servidor');
                router.refresh();
            } else {
                showMessage('error', result.error || 'Error al guardar');
            }
        });
    };

    const remove = async () => {
        if (!confirm('¿Seguro que quieres eliminar esta fase permanentemente?')) return;
        startTransition(async () => {
            const result = await deleteLesson(initialLesson.id, courseId);
            if (result.success) {
                router.push(`/admin/courses/${courseId}`);
            } else {
                showMessage('error', result.error || 'Error al eliminar');
            }
        });
    };

    const applyAISuggestion = (stepsCount: number) => {
        updateField('total_steps', stepsCount);
        showMessage('success', 'Estructura de IA aplicada');
        setTimelineKey(prev => prev + 1);
    };

    return {
        formData,
        isPending,
        message,
        timelineKey,
        updateField,
        save,
        remove,
        applyAISuggestion,
        setMessage: showMessage
    };
}
