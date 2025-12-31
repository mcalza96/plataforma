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
        <div className="flex flex-1 w-full bg-[#1A1A1A] text-gray-200 overflow-hidden min-h-0">
            {/* Left Panel: Socratic Chat (40%) */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-[40%] flex flex-col border-r border-[#333333] overflow-hidden min-h-0"
            >
                {chatPanel}
            </motion.aside>

            {/* Right Panel: Knowledge Engineering Blueprint (60%) */}
            <motion.main
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 flex flex-col overflow-hidden bg-[#121212] min-h-0"
            >
                {blueprintPanel}
            </motion.main>
        </div>
    );
}
