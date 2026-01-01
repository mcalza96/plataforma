'use client';

import { useState } from 'react';
import { StepData } from '@/components/admin/StepCard';
import { arrayMove } from '@dnd-kit/sortable';
import { Lesson } from '@/lib/domain/course';

export function useTimelineController(initialLesson: Lesson) {
    const [steps, setSteps] = useState<StepData[]>(() => {
        try {
            return JSON.parse(initialLesson.description || '[]');
        } catch {
            return [];
        }
    });

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

    const addGeneratedSteps = (newSteps: StepData[]) => {
        setSteps(prev => [...prev, ...newSteps]);
    };

    return {
        steps,
        addStep,
        removeStep,
        updateStep,
        reorderSteps,
        addGeneratedSteps
    };
}
