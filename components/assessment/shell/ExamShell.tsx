'use client';

import React, { memo } from 'react';
import { ExamSidebar } from './ExamSidebar';
import { ExamContent } from './ExamContent';
import { ExamToolbar } from './ExamToolbar';
import { useExamOrchestrator } from '@/hooks/student/use-exam-orchestrator';
import { Question } from '@/lib/domain/assessment';
import { WifiOff, AlertTriangle } from 'lucide-react';

/**
 * ExamShell - Main Orchestrator for Non-Linear Navigation
 * Refactored to adhere to SRP by delegating logic to useExamOrchestrator hook.
 */
export const ExamShell = memo(function ExamShell({
    questions,
    attemptId,
    examId,
}: { questions: Question[], attemptId: string, examId: string }) {
    const {
        currentQuestionIndex,
        setCurrentQuestionIndex,
        questionMetadata,
        isOffline,
        handleAnswer,
        toggleFlag,
        handleDontKnow,
        finishExam,
        currentQuestion,
        allAnswered
    } = useExamOrchestrator(questions, attemptId, examId);

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="flex h-screen bg-[#1A1A1A] relative">
            {/* Offline Banner */}
            {isOffline && (
                <div className="absolute top-0 left-0 right-0 z-[200] bg-amber-500 text-black px-6 py-3 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-2xl animate-in slide-in-from-top duration-500">
                    <WifiOff size={18} />
                    Sin conexión a internet. Sigue respondiendo, tus datos se sincronizarán al volver.
                    <AlertTriangle size={18} className="animate-pulse" />
                </div>
            )}

            {/* Sidebar */}
            <ExamSidebar
                questions={questionMetadata}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={setCurrentQuestionIndex}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <ExamContent currentQuestion={currentQuestion} handleAnswer={handleAnswer} />
                    </div>
                </div>

                {/* Bottom Toolbar */}
                <ExamToolbar
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    isFlagged={!!questionMetadata[currentQuestionIndex]?.isFlagged}
                    allAnswered={allAnswered}
                    onToggleFlag={toggleFlag}
                    onDontKnow={handleDontKnow}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onFinish={finishExam}
                />
            </div>
        </div>
    );
});
