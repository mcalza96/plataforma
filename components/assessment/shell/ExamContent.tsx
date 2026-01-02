import React from 'react';
import { LegoCBM } from '../legos/LegoCBM';
import { LegoRanking } from '../legos/LegoRanking';
import { LegoSpotting } from '../legos/LegoSpotting';
import { Question, AnswerPayload } from '@/lib/domain/assessment';

interface ExamContentProps {
    currentQuestion: Question;
    handleAnswer: (payload: AnswerPayload) => void;
}

export const ExamContent = ({ currentQuestion, handleAnswer }: ExamContentProps) => {
    if (!currentQuestion) return null;

    const commonProps = {
        questionId: currentQuestion.id,
        stem: currentQuestion.stem,
        onAnswer: handleAnswer,
    };

    switch (currentQuestion.type) {
        case 'CBM':
            return <LegoCBM {...commonProps} options={currentQuestion.options} />;
        case 'RANKING':
            return <LegoRanking {...commonProps} items={currentQuestion.items} />;
        case 'SPOTTING':
            return (
                <LegoSpotting
                    {...commonProps}
                    text={currentQuestion.text}
                    interactiveSegments={currentQuestion.interactiveSegments}
                />
            );
        default:
            const fallbackQ = currentQuestion as any;
            console.warn(`[ExamShell] Unknown question type: ${fallbackQ.type}. Falling back to CBM.`);
            return <LegoCBM {...commonProps} options={fallbackQ.options || []} />;
    }
};
