import React from 'react';

interface ExamToolbarProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    isFlagged: boolean;
    allAnswered: boolean;
    onToggleFlag: () => void;
    onDontKnow: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export const ExamToolbar = ({
    currentQuestionIndex,
    totalQuestions,
    isFlagged,
    allAnswered,
    onToggleFlag,
    onDontKnow,
    onPrevious,
    onNext,
    onFinish
}: ExamToolbarProps) => {
    return (
        <div className="border-t border-white/5 bg-[#252525] p-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleFlag}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${isFlagged
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-yellow-500/30'
                            }`}
                    >
                        🚩 {isFlagged ? 'Marcada' : 'Marcar'}
                    </button>
                    <button
                        onClick={onDontKnow}
                        className="px-4 py-2 rounded-lg font-semibold bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                    >
                        ❓ No sé
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onPrevious}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-2 rounded-lg font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Anterior
                    </button>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <button
                            onClick={onNext}
                            className="px-6 py-2 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-all"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            onClick={onFinish}
                            disabled={!allAnswered}
                            className="px-6 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ✓ Finalizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
