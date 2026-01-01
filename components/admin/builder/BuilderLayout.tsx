'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type BuilderMode = 'interview' | 'construction' | 'preview';

interface BuilderLayoutProps {
    mode: BuilderMode;
    chatPanel: React.ReactNode;
    contentPanel: React.ReactNode;
    hudPanel?: React.ReactNode;
}

/**
 * BuilderLayout
 * Specialized dual panel layout that adapts its proportions based on the current mode.
 * 
 * - Interview: Chat (40%) | Content (60%)
 * - Construction: Chat (15% - Collapsed) | Content (85% - Expanded)
 * - Preview: Chat (0%) | Content (100%)
 */
export function BuilderLayout({ mode, chatPanel, contentPanel, hudPanel }: BuilderLayoutProps) {
    const isPreview = mode === 'preview';
    const isConstruction = mode === 'construction';

    return (
        <div className="flex flex-1 w-full bg-[#1A1A1A] text-gray-200 overflow-hidden min-h-0 relative">
            {/* Left Panel: AI Agent / Chat */}
            <AnimatePresence mode="wait">
                {!isPreview && (
                    <motion.aside
                        key="chat-panel"
                        initial={{ width: '40%', opacity: 1 }}
                        animate={{
                            width: isConstruction ? '18%' : '40%',
                            opacity: 1,
                            transition: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                                opacity: { duration: 0.2 }
                            }
                        }}
                        exit={{ width: '0%', opacity: 0 }}
                        className={cn(
                            "flex flex-col border-r border-[#333333] overflow-hidden min-h-0 relative z-20",
                            isConstruction && "bg-[#121212]"
                        )}
                    >
                        {chatPanel}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Right Panel: Canvas / Blueprint / Preview */}
            <motion.main
                layout
                className="flex-1 flex flex-col overflow-hidden bg-[#121212] min-h-0 relative z-10"
                animate={{
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                }}
            >
                {/* HUD Overlay (Optional) */}
                {hudPanel && mode !== 'preview' && (
                    <div className="absolute top-6 right-8 z-30 pointer-events-none">
                        <div className="pointer-events-auto">
                            {hudPanel}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex flex-col">
                    {contentPanel}
                </div>
            </motion.main>
        </div>
    );
}
