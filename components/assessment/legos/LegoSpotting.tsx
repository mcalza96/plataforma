'use client';

import React, { useState, useEffect, memo } from 'react';
import type { AnswerPayload } from '@/lib/domain/assessment';
import { useTelemetry } from '../hooks/useTelemetry';

interface LegoSpottingProps {
    questionId: string;
    stem: string;
    text: string;
    interactiveSegments: Array<{
        id: string;
        startIndex: number;
        endIndex: number;
    }>;
    onAnswer: (payload: AnswerPayload) => void;
}

/**
 * Spotting Component (Error Detection in Text)
 * Highlights interactive segments on hover, marks error on click
 */
export const LegoSpotting = memo(function LegoSpotting({
    questionId,
    stem,
    text,
    interactiveSegments,
    onAnswer,
}: LegoSpottingProps) {
    const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
    const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
    const { start, logInteraction, captureSnapshot } = useTelemetry();

    // Initialize telemetry on mount
    useEffect(() => {
        start();
    }, [start]);

    const handleSegmentClick = (segmentId: string) => {
        logInteraction('CLICK');
        setSelectedSegmentId(segmentId);
    };

    const handleSegmentHover = (segmentId: string | null) => {
        if (segmentId) {
            logInteraction('HOVER');
        }
        setHoveredSegmentId(segmentId);
    };

    const handleSubmit = () => {
        if (!selectedSegmentId) return;

        const telemetry = captureSnapshot();

        onAnswer({
            questionId,
            value: selectedSegmentId,
            isGap: false,
            telemetry,
        });
    };

    /**
     * Render text with interactive segments
     */
    const renderText = () => {
        // Sort segments by startIndex to process in order
        const sortedSegments = [...interactiveSegments].sort(
            (a, b) => a.startIndex - b.startIndex
        );

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedSegments.forEach((segment) => {
            // Add text before segment
            if (segment.startIndex > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {text.slice(lastIndex, segment.startIndex)}
                    </span>
                );
            }

            // Add interactive segment
            const segmentText = text.slice(segment.startIndex, segment.endIndex);
            const isSelected = selectedSegmentId === segment.id;
            const isHovered = hoveredSegmentId === segment.id;

            parts.push(
                <span
                    key={segment.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSegmentClick(segment.id)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSegmentClick(segment.id);
                        }
                    }}
                    onMouseEnter={() => handleSegmentHover(segment.id)}
                    onMouseLeave={() => handleSegmentHover(null)}
                    aria-label={`Segmento interactivo: ${segmentText}`}
                    aria-pressed={isSelected}
                    className={`
            relative inline-block px-1 py-0.5 rounded transition-all duration-200 cursor-pointer select-text
            ${isSelected
                            ? 'bg-red-500/30 text-red-300 ring-2 ring-red-500'
                            : isHovered
                                ? 'bg-red-500/20 text-red-200'
                                : 'bg-transparent text-white hover:bg-red-500/10'
                        }
          `}
                >
                    {segmentText}
                    {isSelected && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] pointer-events-none">
                            ✕
                        </span>
                    )}
                </span>
            );

            lastIndex = segment.endIndex;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>
            );
        }

        return parts;
    };

    return (
        <div className="space-y-6">
            {/* Question Stem */}
            <div className="bg-[#252525] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white leading-relaxed">
                    {stem}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                    Haz clic en el segmento que contiene el error
                </p>
            </div>

            {/* Interactive Text */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8">
                <div className="font-mono text-base leading-relaxed text-white whitespace-pre-wrap">
                    {renderText()}
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!selectedSegmentId}
                aria-label="Confirmar error detectado"
                className={`
          w-full font-bold py-4 px-6 rounded-xl transition-all
          ${selectedSegmentId
                        ? 'bg-amber-500 hover:bg-amber-600 text-black hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
        `}
            >
                {selectedSegmentId ? 'Confirmar Error' : 'Selecciona un segmento'}
            </button>
        </div>
    );
});
