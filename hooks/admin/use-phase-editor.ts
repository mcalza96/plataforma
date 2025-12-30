'use client';

import { useState, useTransition } from 'react';
import { Lesson } from '@/lib/domain/course';
import { StepData } from '@/components/admin/StepCard';
import { upsertLesson } from '@/lib/admin-content-actions';
import { arrayMove } from '@dnd-kit/sortable';

export function usePhaseEditor(initialLesson: Lesson) {
    const [isPending, startTransition] = useTransition();
    const [lesson, setLesson] = useState<Lesson>(initialLesson);

    // Parse description as steps if it's JSON, else empty array
    // (We will use description field to store steps JSON for now as a tactical simplification)
    const [steps, setSteps] = useState<StepData[]>(() => {
        try {
            return JSON.parse(initialLesson.description || '[]');
        } catch {
            return [];
        }
    });

    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const updateField = (field: keyof Lesson, value: any) => {
        setLesson(prev => ({ ...prev, [field]: value }));
    };

    const addStep = () => {
        const newStep: StepData = {
            id: `step-${Date.now()}`,
            title: `Nuevo Paso ${steps.length + 1}`,
            description: '',
            type: 'video',
            duration: 5
        };
        setSteps(prev => [...prev, newStep]);
    };

    const removeStep = (id: string) => {
        setSteps(prev => prev.filter(s => s.id !== id));
    };

    const updateStep = (id: string, updates: Partial<StepData>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const reorderSteps = (activeId: string, overId: string) => {
        setSteps((items) => {
            const oldIndex = items.findIndex((i) => i.id === activeId);
            const newIndex = items.findIndex((i) => i.id === overId);
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const applyAISuggestions = (suggestions: { title: string }[]) => {
        const newSteps: StepData[] = suggestions.map((s, idx) => ({
            id: `ai-step-${Date.now()}-${idx}`,
            title: s.title,
            description: '',
            type: 'video',
            duration: 5
        }));
        setSteps(prev => [...prev, ...newSteps]);
    };

    const saveChanges = async () => {
        startTransition(async () => {
            setStatus('saving');
            // We store steps in the description field for simplicity in this exercise
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
        steps,
        isPending: isPending || status === 'saving',
        status,
        updateField,
        addStep,
        removeStep,
        updateStep,
        reorderSteps,
        applyAISuggestions,
        saveChanges
    };
}
