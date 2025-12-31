'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ArchitectLayoutProps {
    chatPanel: React.ReactNode;
    blueprintPanel: React.ReactNode;
}

/**
 * ArchitectLayout
 * A specialized split-view layout for the TeacherOS Architect.
 * Divides the screen into 40% (Left - Chat) and 60% (Right - Blueprint).
 * Optimized for high-focus engineering work in Dark Mode.
 */
export function ArchitectLayout({ chatPanel, blueprintPanel }: ArchitectLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] text-gray-200 overflow-hidden">
            {/* Left Panel: Socratic Chat (40%) */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-[40%] h-full border-r border-[#333333] flex flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto">
                    {chatPanel}
                </div>
            </motion.aside>

            {/* Right Panel: Knowledge Engineering Blueprint (60%) */}
            <motion.main
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-[60%] h-full flex flex-col overflow-hidden bg-[#121212]"
            >
                <div className="flex-1 overflow-y-auto">
                    {blueprintPanel}
                </div>
            </motion.main>
        </div>
    );
}
