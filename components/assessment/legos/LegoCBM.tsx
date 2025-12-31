'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnswerPayload } from '@/lib/domain/assessment';
import { useTelemetry } from '../hooks/useTelemetry';

interface LegoCBMProps {
    questionId: string;
    stem: string;
    options: Array<{ id: string; text: string }>;
    onAnswer: (payload: AnswerPayload) => void;
}

/**
 * Confidence-Based Marking Component
 * Two-step process: Select answer → Select confidence level
 */
export const LegoCBM = memo(function LegoCBM({
    questionId,
    stem,
    options,
    onAnswer,
}: LegoCBMProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [previousSelection, setPreviousSelection] = useState<string | null>(null);
    const [showConfidenceBar, setShowConfidenceBar] = useState(false);
    const { start, logInteraction, setConfidenceLevel, captureSnapshot } = useTelemetry();

    // Initialize telemetry on mount
    useEffect(() => {
        start();
    }, [start]);

    const handleOptionSelect = (optionId: string) => {
        // Track hesitation if changing answer
        if (selectedOption && selectedOption !== optionId) {
            logInteraction('CHANGE');
        }

        setPreviousSelection(selectedOption);
        setSelectedOption(optionId);
        setShowConfidenceBar(true);
        logInteraction('CLICK');
    };

    const handleConfidenceSelect = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
        if (!selectedOption) return;

        setConfidenceLevel(level);
        const telemetry = captureSnapshot();

        onAnswer({
            questionId,
            value: selectedOption,
            isGap: false,
            telemetry: {
                ...telemetry,
                confidence: level,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Question Stem */}
            <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white leading-relaxed">
                    {stem}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    const wasPrevious = previousSelection === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            onMouseEnter={() => logInteraction('HOVER')}
                            aria-label={`Opción: ${option.text}`}
                            aria-pressed={isSelected}
                            className={`
                w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                ${isSelected
                                    ? 'bg-amber-500/10 border-amber-500 text-white'
                                    : wasPrevious
                                        ? 'bg-white/5 border-white/10 text-gray-300'
                                        : 'bg-[#252525] border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5'
                                }
              `}
                        >
                            <div className="flex items-center gap-4">
                                {/* Radio indicator */}
                                <div
                                    className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-amber-500' : 'border-gray-600'}
                  `}
                                >
                                    {isSelected && (
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    )}
                                </div>
                                <span className="flex-1 font-medium">{option.text}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Confidence Bar */}
            <AnimatePresence>
                {showConfidenceBar && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#1A1A1A] border border-amber-500/20 rounded-2xl p-6"
                    >
                        <p className="text-sm text-gray-400 mb-4 font-medium">
                            ¿Qué tan seguro estás de tu respuesta?
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleConfidenceSelect('LOW')}
                                aria-label="Confianza baja: Adivinando"
                                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-105"
                            >
                                🤔 Adivinando
                            </button>
                            <button
                                onClick={() => handleConfidenceSelect('MEDIUM')}
                                aria-label="Confianza media: Creo que sí"
                                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-105"
                            >
                                🤨 Creo
                            </button>
                            <button
                                onClick={() => handleConfidenceSelect('HIGH')}
                                aria-label="Confianza alta: Seguro"
                                className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-105"
                            >
                                ✅ Seguro
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
