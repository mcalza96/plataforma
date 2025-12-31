'use client';

import React, { memo } from 'react';
import type { QuestionMetadata } from '@/lib/domain/assessment';

interface ExamSidebarProps {
    questions: QuestionMetadata[];
    currentQuestionIndex: number;
    onQuestionSelect: (index: number) => void;
}

/**
 * Exam Sidebar - Navigation Matrix (1-N)
 * Visual states: Gray (Not Seen), Blue Border (Seen), Blue Fill (Answered), Yellow Flag (Flagged)
 */
export const ExamSidebar = memo(function ExamSidebar({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
}: ExamSidebarProps) {
    const getButtonStyle = (question: QuestionMetadata, index: number) => {
        const isCurrent = index === currentQuestionIndex;
        const { state, isFlagged } = question;

        // Base styles
        let bgColor = 'bg-gray-700'; // NOT_SEEN
        let borderColor = 'border-gray-600';
        let textColor = 'text-gray-400';

        if (state === 'ANSWERED') {
            bgColor = 'bg-blue-500';
            borderColor = 'border-blue-500';
            textColor = 'text-white';
        } else if (state === 'SEEN') {
            bgColor = 'bg-transparent';
            borderColor = 'border-blue-500';
            textColor = 'text-blue-400';
        }

        if (isCurrent) {
            borderColor = 'border-amber-500 ring-2 ring-amber-500/30';
        }

        return { bgColor, borderColor, textColor };
    };

    return (
        <div className="w-64 bg-[#1A1A1A] border-r border-white/5 p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">Navegación</h2>
                <p className="text-xs text-gray-500">
                    {questions.filter((q) => q.state === 'ANSWERED').length} de{' '}
                    {questions.length} respondidas
                </p>
            </div>

            {/* Legend */}
            <div className="mb-6 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" />
                    <span className="text-gray-500">No vista</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-transparent border-2 border-blue-500" />
                    <span className="text-gray-500">Vista</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-gray-500">Respondida</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-gray-500">Marcada</span>
                </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-4 gap-2">
                {questions.map((question, index) => {
                    const { bgColor, borderColor, textColor } = getButtonStyle(
                        question,
                        index
                    );

                    return (
                        <button
                            key={question.id}
                            onClick={() => onQuestionSelect(index)}
                            aria-label={`Pregunta ${index + 1}`}
                            aria-current={index === currentQuestionIndex ? 'true' : 'false'}
                            className={`
                relative w-12 h-12 rounded-lg border-2 font-bold transition-all
                hover:scale-110 active:scale-95
                ${bgColor} ${borderColor} ${textColor}
              `}
                        >
                            {index + 1}
                            {/* Flag Indicator */}
                            {question.isFlagged && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
